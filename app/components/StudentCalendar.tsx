'use client'

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip
} from '@mui/material';
import { AttendanceRecord } from '../../types/student';
import { AttendanceRecordWithStudent } from '../../lib/api';
import { getCurrentDateObjectVN } from '../../utils/attendance';

interface StudentCalendarProps {
  studentId: string;
  attendanceRecords: AttendanceRecord[] | AttendanceRecordWithStudent[];
  year?: number;
  month?: number; // 0-based (0 = January)
}

export default function StudentCalendar({ 
  studentId, 
  attendanceRecords, 
  year, 
  month 
}: StudentCalendarProps) {
  // Default to current month if not provided (Hồ Chí Minh timezone)
  const getCurrentDateVN = () => {
    return getCurrentDateObjectVN();
  };
  
  const currentDateVN = getCurrentDateVN();
  const currentYear = year ?? currentDateVN.getFullYear();
  const currentMonth = month ?? currentDateVN.getMonth();

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Vietnamese day names
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  // Get attendance status for a specific date
  const getAttendanceStatus = (day: number) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const record = attendanceRecords.find(r => {
      if (r.studentId === studentId) {
        // Handle both old format (date as string) and new format (date as Date object)
        if (typeof r.date === 'string') {
          return r.date === dateString;
        } else {
          // Convert Date object to string for comparison
          const recordDate = new Date(r.date);
          const recordDateString = recordDate.toISOString().split('T')[0];
          return recordDateString === dateString;
        }
      }
      return false;
    });
    
    if (!record) return 'none'; // No record
    return record.isAbsent ? 'absent' : 'present'; // Absent or Present
  };

  // Get day style based on attendance (responsive)
  const getDayStyle = (status: string, isToday: boolean) => {
    const baseStyle = {
      width: { xs: '32px', sm: '40px' }, // Responsive width
      height: { xs: '32px', sm: '40px' }, // Responsive height
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '6px',
      fontSize: { xs: '12px', sm: '14px' }, // Responsive font size
      fontWeight: isToday ? 'bold' : 'normal',
      border: isToday ? '2px solid #1976d2' : 'none',
      cursor: 'default',
      minWidth: { xs: '32px', sm: '40px' } // Ensure minimum width
    };

    switch (status) {
      case 'present':
        return {
          ...baseStyle,
          backgroundColor: '#4caf50', // Green for present
          color: 'white'
        };
      case 'absent':
        return {
          ...baseStyle,
          backgroundColor: '#f44336', // Red for absent
          color: 'white'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#f5f5f5',
          color: '#666'
        };
    }
  };

  // Check if a day is today (GMT+7)
  const isToday = (day: number) => {
    const todayVN = getCurrentDateVN();
    return todayVN.getFullYear() === currentYear && 
           todayVN.getMonth() === currentMonth && 
           todayVN.getDate() === day;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <Box key={`empty-${i}`} sx={{ 
          width: { xs: '32px', sm: '40px' }, 
          height: { xs: '32px', sm: '40px' }
        }} />
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getAttendanceStatus(day);
      const dayIsToday = isToday(day);
      
      days.push(
        <Box
          key={day}
          sx={getDayStyle(status, dayIsToday)}
        >
          {day}
        </Box>
      );
    }
    
    return days;
  };

  // Count statistics
  const getPresentDays = () => {
    return attendanceRecords.filter(r => 
      r.studentId === studentId && 
      r.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`) &&
      !r.isAbsent
    ).length;
  };

  const getAbsentDays = () => {
    return attendanceRecords.filter(r => 
      r.studentId === studentId && 
      r.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`) &&
      r.isAbsent
    ).length;
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}> {/* Responsive padding */}
      {/* Header */}
      <Typography 
        variant="h6" 
        component="h3" 
        gutterBottom 
        sx={{ 
          textAlign: 'center', 
          color: '#1976d2',
          fontSize: { xs: '1rem', sm: '1.25rem' } // Responsive font size
        }}
      >
        {monthNames[currentMonth]} {currentYear}
      </Typography>

      {/* Statistics */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: { xs: 1, sm: 2 }, // Responsive gap
        mb: 3,
        flexWrap: 'wrap' // Allow wrapping on small screens
      }}>
        <Chip 
          label={`Đi học: ${getPresentDays()} ngày`} 
          color="success" 
          variant="outlined"
          size="small" // Smaller chips for mobile
        />
        <Chip 
          label={`Nghỉ: ${getAbsentDays()} ngày`} 
          color="error" 
          variant="outlined"
          size="small"
        />
      </Box>

      {/* Calendar Header */}
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(7, 1fr)', 
      gap: { xs: 0.5, sm: 1 }, // Responsive gap
      mb: 1 
    }}>
      {dayNames.map(dayName => (
        <Box
        key={dayName}
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          color: dayName === 'CN' ? '#f44336' : '#666',
          fontSize: { xs: '11px', sm: '12px' }, // Responsive font
          py: { xs: 0.5, sm: 1 }
        }}
        >
        {dayName}
        </Box>
      ))}
    </Box>

      {/* Calendar Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: { xs: 0.5, sm: 1 }, // Responsive gap
        justifyItems: 'center' // Center items in grid
      }}>
        {generateCalendarDays()}
      </Box>

      {/* Legend */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: { xs: 1.5, sm: 3 }, // Responsive gap
        mt: 3,
        flexWrap: 'wrap' // Allow wrapping
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ 
            width: { xs: 12, sm: 16 }, 
            height: { xs: 12, sm: 16 }, 
            backgroundColor: '#4caf50', 
            borderRadius: 1 
          }} />
          <Typography variant="caption" sx={{ fontSize: { xs: '10px', sm: '12px' } }}>
            Đi học
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ 
            width: { xs: 12, sm: 16 }, 
            height: { xs: 12, sm: 16 }, 
            backgroundColor: '#f44336', 
            borderRadius: 1 
          }} />
          <Typography variant="caption" sx={{ fontSize: { xs: '10px', sm: '12px' } }}>
            Nghỉ
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ 
            width: { xs: 12, sm: 16 }, 
            height: { xs: 12, sm: 16 }, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 1, 
            border: '1px solid #ccc' 
          }} />
          <Typography variant="caption" sx={{ fontSize: { xs: '10px', sm: '12px' } }}>
            Chưa có dữ liệu
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}