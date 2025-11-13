'use client'

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography
} from '@mui/material';

interface AddStudentDialogProps {
  open: boolean;
  onClose: () => void;
  onAddStudent: (name: string) => void;
}

export default function AddStudentDialog({ open, onClose, onAddStudent }: AddStudentDialogProps) {
  const [studentName, setStudentName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!studentName.trim()) {
      setError('Vui lòng nhập tên học sinh');
      return;
    }
    
    if (studentName.trim().length < 2) {
      setError('Tên học sinh phải có ít nhất 2 ký tự');
      return;
    }
    
    onAddStudent(studentName.trim());
    setStudentName('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setStudentName('');
    setError('');
    onClose();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" component="h2">
          Thêm Học Sinh Mới
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Tên học sinh"
            placeholder="Nhập tên học sinh..."
            value={studentName}
            onChange={(e) => {
              setStudentName(e.target.value);
              if (error) setError('');
            }}
            onKeyPress={handleKeyPress}
            error={!!error}
            helperText={error}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          color="inherit"
        >
          Hủy
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!studentName.trim()}
        >
          Thêm
        </Button>
      </DialogActions>
    </Dialog>
  );
}