'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip
} from '@mui/material';
import { StudentAttendance } from '../../types/student';

interface StudentListProps {
  students: StudentAttendance[];
  onMarkPresent: (studentId: string) => void;
}

export default function StudentList({ students, onMarkPresent }: StudentListProps) {
  const router = useRouter();

  const handleViewDetail = (studentId: string) => {
    router.push(`/student/${studentId}`);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 2
        }}
      >
        {students.map((student) => (
          <Box key={student.id}>
            <Card 
              sx={{ 
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: student.isAbsentToday ? '2px solid #4caf50' : '1px solid #e0e0e0'
              }}
            >
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  {student.name}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Số buổi đã học tháng này:
                  </Typography>
                  <Chip 
                    label={`${student.totalSessionsThisMonth} buổi`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>

                {student.isAbsentToday && (
                  <Chip 
                    label="Đã học hôm nay"
                    color="success"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                )}
              </CardContent>
              
              <Box sx={{ p: 2, pt: 0 }}>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                  <Button
                    variant={student.isAbsentToday ? "outlined" : "contained"}
                    color={student.isAbsentToday ? "success" : "primary"}
                    fullWidth
                    disabled={!student.canMarkAbsent}
                    onClick={() => onMarkPresent(student.id)}
                  >
                    {student.isAbsentToday ? "Đã học" : "Đánh dấu học"}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    size="small"
                    onClick={() => handleViewDetail(student.id)}
                  >
                    Xem chi tiết
                  </Button>
                </Box>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
}