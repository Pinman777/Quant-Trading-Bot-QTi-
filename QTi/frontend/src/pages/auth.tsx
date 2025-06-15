import React, { useState } from 'react';
import { Box, Container, Typography, Alert } from '@mui/material';
import AuthManager from '../components/auth/AuthManager';

const AuthPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement actual login logic with JWT
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      // Store JWT token
      localStorage.setItem('token', data.token);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, confirmPassword: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement actual registration logic
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      setSuccess('Registration successful! Please check your email to verify your account.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement actual password reset logic
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Password reset failed');
      }

      setSuccess('Password reset instructions have been sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement actual social login logic
      const response = await fetch(`/api/auth/${provider}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`${provider} login failed`);
      }

      const data = await response.json();
      // Store JWT token
      localStorage.setItem('token', data.token);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : `${provider} login failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Welcome to QTi
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
          Sign in to manage your trading bots
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <AuthManager
          onLogin={handleLogin}
          onRegister={handleRegister}
          onResetPassword={handleResetPassword}
          onSocialLogin={handleSocialLogin}
          loading={loading}
          error={error}
        />
      </Box>
    </Container>
  );
};

export default AuthPage; 