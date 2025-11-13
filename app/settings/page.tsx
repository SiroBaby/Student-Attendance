'use client'

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  InputAdornment,
  Alert,
  Divider,
  Paper
} from '@mui/material';
import { settingsApi } from '../../lib/api';
import SaveIcon from '@mui/icons-material/Save';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

// Default daily fee
const DEFAULT_DAILY_FEE = 70000;

export default function Settings() {
  const [dailyFee, setDailyFee] = useState<number>(DEFAULT_DAILY_FEE);
  const [inputValue, setInputValue] = useState<string>(DEFAULT_DAILY_FEE.toString());
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Load settings từ database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const fee = await settingsApi.getDailyFee();
        setDailyFee(fee);
        setInputValue(fee.toString());
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback to default
        setDailyFee(DEFAULT_DAILY_FEE);
        setInputValue(DEFAULT_DAILY_FEE.toString());
      }
    };
    
    loadSettings();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    setError('');
    setShowSuccess(false);
  };

  const handleSave = async () => {
    const numValue = parseInt(inputValue.replace(/[^0-9]/g, ''));
    
    if (isNaN(numValue) || numValue <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ (lớn hơn 0)');
      return;
    }

    if (numValue > 1000000) {
      setError('Số tiền không được vượt quá 1,000,000 VNĐ');
      return;
    }

    try {
      // Gọi API để lưu settings vào database
      await settingsApi.updateDailyFee(numValue);
      
      setDailyFee(numValue);
      setInputValue(numValue.toString());
      setError('');
      setShowSuccess(true);

      // Ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu cài đặt');
    }
  };

  const handleReset = async () => {
    try {
      // Reset to default value in database
      await settingsApi.updateDailyFee(DEFAULT_DAILY_FEE);
      
      setDailyFee(DEFAULT_DAILY_FEE);
      setInputValue(DEFAULT_DAILY_FEE.toString());
      setError('');
      setShowSuccess(false);
    } catch (error) {
      console.error('Error resetting settings:', error);
      setError('Có lỗi xảy ra khi reset cài đặt');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          {/* Header */}
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
            Cài Đặt Hệ Thống
          </Typography>

          {/* Success Alert */}
          {showSuccess && (
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              onClose={() => setShowSuccess(false)}
            >
              Cài đặt đã được lưu thành công!
            </Alert>
          )}

          {/* Main Settings Card */}
          <Card sx={{ mb: 3, boxShadow: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <MonetizationOnIcon sx={{ mr: 2, color: '#1976d2', fontSize: 28 }} />
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  Cài Đặt Học Phí
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Giá tiền mỗi ngày học
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Thiết lập số tiền học phí cho mỗi ngày học của học sinh
                </Typography>

                <TextField
                  fullWidth
                  label="Học phí hàng ngày"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  error={!!error}
                  helperText={error}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                  }}
                  sx={{ mb: 3 }}
                />

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{ px: 3 }}
                  >
                    Lưu Cài Đặt
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleReset}
                    sx={{ px: 3 }}
                  >
                    Đặt Lại Mặc Định
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Current Settings Info */}
          <Paper sx={{ p: 3, backgroundColor: '#e3f2fd' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Thông Tin Hiện Tại
            </Typography>
            
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">
                  Học phí hàng ngày:
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(dailyFee)}
                </Typography>
              </Box>
              
              <Divider />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Ví dụ: 10 ngày học = 
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(dailyFee * 10)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}