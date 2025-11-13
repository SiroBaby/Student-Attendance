import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { convertUTCDateToVN } from '@/utils/attendance';

// GET /api/students - Lấy danh sách tất cả học sinh (chỉ active students)
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      where: {
        deletedAt: null // Chỉ lấy students chưa bị xóa
      },
      include: {
        attendanceRecords: {
          orderBy: {
            date: 'desc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Convert all datetime fields to proper format for JSON response
    const studentsWithConvertedDates = students.map(student => ({
      ...student,
      deletedAt: student.deletedAt?.toISOString() || null,
      createdAt: student.createdAt.toISOString(),
      updatedAt: student.updatedAt.toISOString(),
      attendanceRecords: student.attendanceRecords.map(record => ({
        ...record,
        date: convertUTCDateToVN(record.date), // Convert UTC to GMT+7 string
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString()
      }))
    }));

    return NextResponse.json({
      success: true,
      data: studentsWithConvertedDates
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch students'
      },
      { status: 500 }
    );
  }
}

// POST /api/students - Tạo học sinh mới
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name is required and must be at least 2 characters long'
        },
        { status: 400 }
      );
    }

    const student = await prisma.student.create({
      data: {
        name: name.trim()
      },
      include: {
        attendanceRecords: true
      }
    });

    // Convert datetime fields for JSON response
    const studentWithConvertedDates = {
      ...student,
      deletedAt: student.deletedAt?.toISOString() || null,
      createdAt: student.createdAt.toISOString(),
      updatedAt: student.updatedAt.toISOString(),
      attendanceRecords: student.attendanceRecords.map(record => ({
        ...record,
        date: convertUTCDateToVN(record.date),
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString()
      }))
    };

    return NextResponse.json({
      success: true,
      data: studentWithConvertedDates
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create student'
      },
      { status: 500 }
    );
  }
}