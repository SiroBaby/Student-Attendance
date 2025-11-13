'use client'

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Trang Chủ',
      path: '/',
      icon: <HomeIcon sx={{ mr: 1 }} />
    },
    {
      name: 'Cài Đặt',
      path: '/settings',
      icon: <SettingsIcon sx={{ mr: 1 }} />
    }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/' || pathname.startsWith('/student/');
    }
    return pathname === path;
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ px: 0 }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 'bold'
            }}
          >
            Quản Lý Học Sinh
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {navigation.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => handleNavigation(item.path)}
                sx={{
                  backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  borderRadius: 1,
                  px: 2,
                  py: 1
                }}
              >
                {item.icon}
                {item.name}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}