import React from 'react';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../theme';
import { AuthProvider } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Box } from '@mui/material';

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Component {...pageProps} />
          </Box>
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 