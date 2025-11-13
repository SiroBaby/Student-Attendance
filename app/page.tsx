'use client'

import { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, Alert, CircularProgress } from "@mui/material";
import StudentList from './components/StudentList';
import AddStudentDialog from './components/AddStudentDialog';
import { StudentAttendance } from '../types/student';
import { convertDBStudentsToStudentAttendance, markPresent, getCurrentDateObjectVN } from '../utils/attendance';
import { studentsApi } from '../lib/api';

export default function Home() {
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isClient, setIsClient] = useState<boolean>(false);

  // Client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load dữ liệu từ database khi component mount
  useEffect(() => {
    loadStudents();
    
    // Set current date - chỉ khi đã hydrate
    if (isClient) {
      const vnDateObject = getCurrentDateObjectVN();
      const formattedDate = vnDateObject.toLocaleDateString('vi-VN');
      setCurrentDate(formattedDate);
    }
  }, [isClient]);

  // Hàm load học sinh từ database
  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const dbStudents = await studentsApi.getAll();
      const studentAttendance = convertDBStudentsToStudentAttendance(dbStudents);
      setStudents(studentAttendance);
    } catch (err) {
      console.error('Error loading students:', err);
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi nhấn nút "Học"
  const handleMarkPresent = async (studentId: string) => {
    try {
      await markPresent(studentId);
      // Reload students để cập nhật UI
      await loadStudents();
    } catch (err) {
      console.error('Error marking student present:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark student present');
    }
  };

  // Xử lý thêm học sinh mới
  const handleAddStudent = async (name: string) => {
    try {
      await studentsApi.create(name);
      await loadStudents(); // Reload để hiển thị học sinh mới
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('Error adding student:', err);
      setError(err instanceof Error ? err.message : 'Failed to add student');
    }
  };

  // Xử lý mở/đóng dialog
  const handleOpenAddDialog = () => setIsAddDialogOpen(true);
  const handleCloseAddDialog = () => setIsAddDialogOpen(false);

  if (loading) {
    return (
      <Box sx={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#f5f5f5' }}>
        <Container maxWidth="lg">
          <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress size={60} />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              textAlign: 'center',
              fontWeight: 'bold',
              color: '#1976d2',
              mb: 4
            }}
          >
            ĐIỂM DANH HỌC SINH
          </Typography>
          
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              textAlign: 'center',
              color: '#666',
              mb: 3
            }}
          >
            {isClient ? `Ngày hôm nay: ${currentDate}` : 'Đang tải...'}
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenAddDialog}
              sx={{ px: 4, py: 1.5 }}
            >
              + Thêm Học Sinh
            </Button>
          </Box>

          <StudentList 
            students={students}
            onMarkPresent={handleMarkPresent}
          />

          <AddStudentDialog
            open={isAddDialogOpen}
            onClose={handleCloseAddDialog}
            onAddStudent={handleAddStudent}
          />
        </Box>
      </Container>
    </Box>
  );
}