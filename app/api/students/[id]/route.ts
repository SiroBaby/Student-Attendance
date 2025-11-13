import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { convertUTCDateToVN } from '@/utils/attendance';

// GET /api/students/[id] - Lấy thông tin chi tiết một học sinh
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to unwrap the Promise
    const { id } = await params;
    
    console.log('Student ID:', id);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student ID is required'
        },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: {
        id: id
      },
      include: {
        attendanceRecords: {
          orderBy: {
            date: 'desc'
          }
        }
      }
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

    // Convert datetime fields for JSON response
    const studentWithConvertedDates = {
      ...student,
      deletedAt: student.deletedAt ? (student.deletedAt as Date).toISOString() : null,
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
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch student'
      },
      { status: 500 }
    );
  }
}

// PUT /api/students/[id] - Cập nhật thông tin học sinh
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to unwrap the Promise
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student ID is required'
        },
        { status: 400 }
      );
    }

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

    const student = await prisma.student.update({
      where: {
        id: id
      },
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
      deletedAt: student.deletedAt ? student.deletedAt.toISOString() : null,
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
    });
  } catch (error) {
    console.error('Error updating student:', error);
    
    // Check if it's a "record not found" error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'Student not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update student'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/students/[id] - Xóa học sinh
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to unwrap the Promise
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student ID is required'
        },
        { status: 400 }
      );
    }

    // Soft delete - set deletedAt to current time
    const deletedStudent = await prisma.student.update({
      where: {
        id: id
      },
      data: {
        deletedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
      data: {
        id: deletedStudent.id,
        deletedAt: deletedStudent.deletedAt?.toISOString()
      }
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    
    // Check if it's a "record not found" error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'Student not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete student'
      },
      { status: 500 }
    );
  }
}