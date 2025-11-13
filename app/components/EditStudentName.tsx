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
  Typography,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

interface EditStudentNameProps {
  studentName: string;
  onUpdateName: (newName: string) => void;
}

export default function EditStudentName({ studentName, onUpdateName }: EditStudentNameProps) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState(studentName);
  const [error, setError] = useState('');

  const handleOpen = () => {
    setNewName(studentName);
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewName(studentName);
    setError('');
  };

  const handleSave = () => {
    if (!newName.trim()) {
      setError('Vui lòng nhập tên học sinh');
      return;
    }
    
    if (newName.trim().length < 2) {
      setError('Tên học sinh phải có ít nhất 2 ký tự');
      return;
    }

    if (newName.trim() === studentName) {
      handleClose();
      return;
    }
    
    onUpdateName(newName.trim());
    setOpen(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <>
      {/* Edit Button */}
      <IconButton 
        onClick={handleOpen}
        size="small"
        sx={{ 
          ml: 1, 
          color: '#666',
          '&:hover': {
            color: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.04)'
          }
        }}
      >
        <EditIcon fontSize="small" />
      </IconButton>

      {/* Edit Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="h2">
            Chỉnh Sửa Tên Học Sinh
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="Tên học sinh"
              placeholder="Nhập tên học sinh..."
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (error) setError('');
              }}
              onKeyPress={handleKeyPress}
              error={!!error}
              helperText={error}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            {newName.trim() && newName.trim() !== studentName && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: '#e3f2fd', 
                borderRadius: 1,
                border: '1px solid #1976d2'
              }}>
                <Typography variant="body2" color="primary">
                  Tên mới: <strong>{newName.trim()}</strong>
                </Typography>
              </Box>
            )}
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
            onClick={handleSave}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={!newName.trim() || newName.trim() === studentName}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}