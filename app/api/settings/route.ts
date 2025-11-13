import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/settings - Lấy tất cả cài đặt
export async function GET() {
  try {
    const settings = await prisma.appSettings.findMany({
      orderBy: {
        key: 'asc'
      }
    });

    // Convert to key-value object for easier use
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      data: settingsObject
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch settings'
      },
      { status: 500 }
    );
  }
}

// POST /api/settings - Cập nhật cài đặt
export async function POST(request: NextRequest) {
  try {
    const { key, value, description } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Key and value are required'
        },
        { status: 400 }
      );
    }

    const setting = await prisma.appSettings.upsert({
      where: {
        key: key
      },
      update: {
        value: String(value),
        description: description || undefined
      },
      create: {
        key: key,
        value: String(value),
        description: description || undefined
      }
    });

    return NextResponse.json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update setting'
      },
      { status: 500 }
    );
  }
}