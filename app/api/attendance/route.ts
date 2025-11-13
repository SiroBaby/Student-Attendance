import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { convertVNDateToUTC, convertUTCDateToVN } from '@/utils/attendance';

// GET /api/attendance - Lấy tất cả bản ghi điểm danh
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const month = searchParams.get('month'); // Format: YYYY-MM
    const date = searchParams.get('date'); // Format: YYYY-MM-DD

    const whereClause: {
      studentId?: string;
      date?: Date | { gte: Date; lte: Date };
    } = {};

    if (studentId) {
      whereClause.studentId = studentId;
    }

    if (month) {
      // Convert VN month to UTC range
      const startDateVN = `${month}-01`;
      const endDateVN = new Date(new Date(`${month}-01`).getFullYear(), new Date(`${month}-01`).getMonth() + 1, 0)
        .toISOString().split('T')[0];
      
      whereClause.date = {
        gte: convertVNDateToUTC(startDateVN),
        lte: convertVNDateToUTC(endDateVN)
      };
    }

    if (date) {
      // Convert VN date to UTC
      whereClause.date = convertVNDateToUTC(date);
    }

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: whereClause,
      include: {
        student: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Convert UTC dates to GMT+7 and serialize to string for JSON response
    const convertedRecords = attendanceRecords.map(record => ({
      ...record,
      date: convertUTCDateToVN(record.date), // Convert to GMT+7 string
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      student: record.student ? {
        ...record.student,
        createdAt: record.student.createdAt.toISOString(),
        updatedAt: record.student.updatedAt.toISOString()
      } : undefined
    }));

    return NextResponse.json({
      success: true,
      data: convertedRecords
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch attendance records'
      },
      { status: 500 }
    );
  }
}

// POST /api/attendance - Tạo hoặc cập nhật bản ghi điểm danh
export async function POST(request: NextRequest) {
  try {
    const { studentId, date, isAbsent } = await request.json();

    if (!studentId || !date) {
      return NextResponse.json(
        {
          success: false,
          error: 'StudentId and date are required'
        },
        { status: 400 }
      );
    }

    // Kiểm tra xem học sinh có tồn tại và chưa bị xóa không
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student || student.deletedAt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student not found'
        },
        { status: 404 }
      );
    }

    // Lấy dailyFee hiện tại từ settings
    const dailyFeeSetting = await prisma.appSettings.findUnique({
      where: { key: 'daily_fee' }
    });
    const currentDailyFee = dailyFeeSetting ? parseInt(dailyFeeSetting.value) : 70000;

    const attendanceDate = convertVNDateToUTC(date); // Convert VN date to UTC
    
    // Sử dụng upsert để tạo mới hoặc cập nhật
    const attendanceRecord = await prisma.attendanceRecord.upsert({
      where: {
        unique_student_date: {
          studentId,
          date: attendanceDate
        }
      },
      update: {
        isAbsent: Boolean(isAbsent),
        dailyFee: currentDailyFee // Update với giá hiện tại
      },
      create: {
        studentId,
        date: attendanceDate,
        isAbsent: Boolean(isAbsent),
        dailyFee: currentDailyFee // Lưu giá tại thời điểm điểm danh
      },
      include: {
        student: true
      }
    });

    // Convert response dates to GMT+7 for client
    const responseData = {
      ...attendanceRecord,
      date: convertUTCDateToVN(attendanceRecord.date),
      createdAt: attendanceRecord.createdAt.toISOString(),
      updatedAt: attendanceRecord.updatedAt.toISOString(),
      student: attendanceRecord.student ? {
        ...attendanceRecord.student,
        deletedAt: attendanceRecord.student.deletedAt ? attendanceRecord.student.deletedAt.toISOString() : null,
        createdAt: attendanceRecord.student.createdAt.toISOString(),
        updatedAt: attendanceRecord.student.updatedAt.toISOString()
      } : undefined
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error creating/updating attendance record:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create/update attendance record'
      },
      { status: 500 }
    );
  }
}