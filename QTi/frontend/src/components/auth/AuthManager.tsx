import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';

interface AuthManagerProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, confirmPassword: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  onSocialLogin: (provider: 'google' | 'github') => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const AuthManager: React.FC<AuthManagerProps> = ({
  onLogin,
  onRegister,
  onResetPassword,
  onSocialLogin,
  loading = false,
  error = null,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setValidationError(null);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    if (!email || !password) {
      setValidationError('Please fill in all required fields');
      return false;
    }

    if (!isLogin && password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }

    if (!isLogin && password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, confirmPassword);
      }
    } catch (err) {
      console.error('Authentication failed:', err);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setValidationError('Please enter your email address');
      return;
    }

    try {
      await onResetPassword(email);
    } catch (err) {
      console.error('Password reset failed:', err);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      await onSocialLogin(provider);
    } catch (err) {
      console.error('Social login failed:', err);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {isLogin ? 'Sign In' : 'Create Account'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {validationError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {validationError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePassword} edge="end">
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {!isLogin && (
            <TextField
              fullWidth
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
            />
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </Button>

          {isLogin && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Link
                component="button"
                variant="body2"
                onClick={handleResetPassword}
                disabled={loading}
              >
                Forgot password?
              </Link>
            </Box>
          )}
        </form>

        <Divider sx={{ my: 3 }}>OR</Divider>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
          >
            Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GitHubIcon />}
            onClick={() => handleSocialLogin('github')}
            disabled={loading}
          >
            GitHub
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link component="button" variant="body2" onClick={handleToggleMode}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Link>
          </Typography>
        </Box>
      </Paper>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Security Tips:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Use a strong, unique password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Enable two-factor authentication
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Never share your credentials
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthManager; 