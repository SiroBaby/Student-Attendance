'use client'

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StudentCalendar from '../../components/StudentCalendar';
import EditStudentName from '../../components/EditStudentName';
import { studentsApi, StudentWithAttendance } from '../../../lib/api';

export default function StudentDetail() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  
  const [student, setStudent] = useState<StudentWithAttendance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => ''); // Lazy initialization
  const [isClient, setIsClient] = useState<boolean>(false);

    // Load dữ liệu học sinh từ database
  const loadStudentData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load student data
      const studentData = await studentsApi.getById(studentId);
      
      setStudent(studentData);
    } catch (err) {
      console.error('Error loading student data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]); // Fixed: include loadStudentData in dependencies

  // Tạo danh sách các tháng có dữ liệu attendance
  const availableMonths = useMemo(() => {
    if (!student?.attendanceRecords) return [];
    
    const months = new Set<string>();
    student.attendanceRecords.forEach(record => {
      const recordMonth = new Date(record.date).toLocaleDateString("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric", 
        month: "2-digit"
      });
      months.add(recordMonth);
    });
    
    return Array.from(months).sort().reverse(); // Newest first
  }, [student?.attendanceRecords]);

  // Khởi tạo selectedMonth với tháng hiện tại hoặc tháng mới nhất có dữ liệu
  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth && isClient) {
      const currentMonth = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric", 
        month: "2-digit"
      });
      
      // Chọn tháng hiện tại nếu có dữ liệu, nếu không thì chọn tháng mới nhất
      const monthToSelect = availableMonths.includes(currentMonth) 
        ? currentMonth 
        : availableMonths[0];
      setSelectedMonth(monthToSelect);
    }
  }, [availableMonths, selectedMonth, isClient]);

  // Tính số buổi học trong tháng được chọn
  const sessionsThisMonth = useMemo(() => {
    if (!student?.attendanceRecords || !selectedMonth) return 0;
    
    return student.attendanceRecords.filter(record => {
      const recordMonth = new Date(record.date).toLocaleDateString("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric", 
        month: "2-digit"
      });
      return recordMonth === selectedMonth;
    }).length;
  }, [student?.attendanceRecords, selectedMonth]);

  // Tính tổng học phí trong tháng được chọn
  const totalFee = useMemo(() => {
    if (!student?.attendanceRecords || !selectedMonth) return 0;
    
    return student.attendanceRecords
      .filter(record => {
        const recordMonth = new Date(record.date).toLocaleDateString("en-CA", {
          timeZone: "Asia/Ho_Chi_Minh",
          year: "numeric", 
          month: "2-digit"
        });
        return recordMonth === selectedMonth;
      })
      .reduce((total, record) => total + record.dailyFee, 0);
  }, [student?.attendanceRecords, selectedMonth]);

  // Tính year và month từ selectedMonth để truyền vào calendar
  const calendarYearMonth = useMemo(() => {
    if (!selectedMonth) {
      // Nếu chưa chọn tháng, dùng tháng hiện tại (chỉ khi client-side)
      if (typeof window !== 'undefined') {
        const now = new Date();
        const currentMonth = now.toLocaleDateString("en-CA", {
          timeZone: "Asia/Ho_Chi_Minh",
          year: "numeric", 
          month: "2-digit"
        });
        const [year, month] = currentMonth.split('-');
        return { year: parseInt(year), month: parseInt(month) - 1 }; // month 0-based
      }
      // Fallback cho server-side rendering
      return { year: 2025, month: 10 }; // November 2025 as default
    }
    
    const [year, month] = selectedMonth.split('-');
    return { year: parseInt(year), month: parseInt(month) - 1 }; // month 0-based
  }, [selectedMonth]);

  // Xử lý cập nhật tên học sinh
  const handleUpdateStudentName = async (newName: string) => {
    try {
      await studentsApi.updateName(studentId, newName);
      // Reload student data để cập nhật UI
      await loadStudentData();
    } catch (err) {
      console.error('Error updating student name:', err);
      setError(err instanceof Error ? err.message : 'Failed to update student name');
    }
  };

  // Xử lý mở dialog xóa học sinh
  const handleDeleteStudent = () => {
    setDeleteDialogOpen(true);
  };

  // Xử lý xóa học sinh (soft delete)
  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      await studentsApi.delete(studentId);
      
      // Chuyển về trang chính sau khi xóa thành công
      router.push('/');
    } catch (err) {
      console.error('Error deleting student:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete student');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Đóng dialog xóa
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  // Format tiền VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Không tìm thấy học sinh
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => router.push('/')}
            sx={{ mt: 2 }}
          >
            Quay lại
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ py: { xs: 2, sm: 4 } }}>
          {/* Header với nút quay lại */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 4 } }}>
            <IconButton 
              onClick={() => router.push('/')}
              sx={{ mr: { xs: 1, sm: 2 } }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography 
              variant="h4"
              component="h1" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#1976d2',
                fontSize: { xs: '1.5rem', sm: '2.125rem' }
              }}
            >
              Chi Tiết Học Sinh
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Card thông tin học sinh */}
          <Card sx={{ mb: { xs: 2, sm: 3 }, boxShadow: 3 }}>
            <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  sx={{ 
                    fontWeight: 'bold', 
                    flexGrow: 1,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  {student.name}
                </Typography>
                <EditStudentName
                  studentName={student.name}
                  onUpdateName={handleUpdateStudentName}
                />
              </Box>
              
              <Chip 
                label={`Mã học sinh: ${student.id}`}
                color="primary"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>

          {/* Layout cho thống kê */}
          <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, flexDirection: 'column' }}>
            {/* Lịch học tập */}
            <Box>
              {/* Dropdown chọn tháng - chỉ hiển thị sau khi hydrate */}
              {isClient && availableMonths.length > 0 && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Chọn tháng để xem</InputLabel>
                    <Select
                      value={selectedMonth}
                      label="Chọn tháng để xem"
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      {availableMonths.map((month) => {
                        const [year, monthNum] = month.split('-');
                        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
                          .toLocaleDateString('vi-VN', { 
                            month: 'long', 
                            year: 'numeric',
                            timeZone: 'Asia/Ho_Chi_Minh'
                          });
                        return (
                          <MenuItem key={month} value={month}>
                            {monthName}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Box>
              )}

              <StudentCalendar 
                studentId={studentId}
                attendanceRecords={student.attendanceRecords || []}
                year={calendarYearMonth.year}
                month={calendarYearMonth.month}
              />
            </Box>

            {/* Thống kê tài chính */}
            <Box>
              <Paper sx={{ p: { xs: 2, sm: 3 }, height: 'fit-content', textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Thống Kê Tài Chính
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                {selectedMonth ? (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Số buổi học trong tháng
                      </Typography>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', my: 1 }}>
                        {sessionsThisMonth}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        buổi học đã tham gia
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Tổng học phí tháng này
                      </Typography>
                      <Typography variant="h4" color="error" sx={{ fontWeight: 'bold', my: 1 }}>
                        {formatCurrency(totalFee)}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Chi tiết hóa đơn tháng này:
                      </Typography>
                      
                      {/* Hiển thị các buổi học của tháng được chọn */}
                      {student?.attendanceRecords
                        ?.filter(record => {
                          const recordMonth = new Date(record.date).toLocaleDateString("en-CA", {
                            timeZone: "Asia/Ho_Chi_Minh",
                            year: "numeric", 
                            month: "2-digit"
                          });
                          return recordMonth === selectedMonth && !record.isAbsent;
                        })
                        ?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        ?.map((record, index, filteredRecords) => (
                          <Box key={record.id} sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            py: 0.5,
                            borderBottom: index === filteredRecords.length - 1 ? 'none' : '1px solid #e0e0e0'
                          }}>
                            <Typography variant="caption">
                              {new Date(record.date).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                timeZone: 'Asia/Ho_Chi_Minh'
                              })}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                              {formatCurrency(record.dailyFee)}
                            </Typography>
                          </Box>
                        )) || (
                        <Typography variant="caption" color="text.secondary">
                          Chưa có ngày học nào trong tháng này
                        </Typography>
                      )}
                    </Box>
                  </>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    Chọn tháng để xem thống kê
                  </Typography>
                )}
              </Paper>
            </Box>
          </Box>

          {/* Nút hành động */}
          <Box sx={{ mt: { xs: 3, sm: 4 }, textAlign: 'center', display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => router.push('/')}
              sx={{ 
                px: 4, 
                py: 1.5,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                minWidth: { xs: '140px', sm: '160px' }
              }}
            >
              Quay về Danh sách
            </Button>
            
            <Button 
              variant="outlined" 
              color="error"
              size="large"
              onClick={handleDeleteStudent}
              sx={{ 
                px: 4, 
                py: 1.5,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                minWidth: { xs: '140px', sm: '160px' },
                borderColor: 'error.main',
                '&:hover': {
                  borderColor: 'error.dark',
                  backgroundColor: 'error.main',
                  color: 'white'
                }
              }}
            >
              Xóa học sinh
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Dialog xác nhận xóa học sinh */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Xác nhận xóa học sinh
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa học sinh <strong>{student?.name}</strong> không?
            <br /><br />
            Học sinh sẽ bị xóa khỏi danh sách nhưng dữ liệu vẫn được lưu trữ trong hệ thống.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleCancelDelete}
            variant="outlined"
            disabled={deleting}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : undefined}
          >
            {deleting ? 'Đang xóa...' : 'Xóa học sinh'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}