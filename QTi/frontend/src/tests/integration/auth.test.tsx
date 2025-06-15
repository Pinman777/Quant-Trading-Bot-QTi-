import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import { authService } from '../../services/auth';

// Mock auth service
jest.mock('../../services/auth', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getToken: jest.fn(),
  },
}));

describe('Authentication Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should handle successful login', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      (authService.login as jest.Mock).mockResolvedValueOnce(mockUser);

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      // Fill in login form
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'testuser' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      // Check loading state
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Wait for login to complete
      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123',
        });
      });

      // Check success state
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('should handle login error', async () => {
      const mockError = new Error('Invalid credentials');
      (authService.login as jest.Mock).mockRejectedValueOnce(mockError);

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      // Fill in login form
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'testuser' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' },
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Registration Flow', () => {
    it('should handle successful registration', async () => {
      const mockUser = { id: 1, username: 'newuser' };
      (authService.register as jest.Mock).mockResolvedValueOnce(mockUser);

      render(
        <AuthProvider>
          <RegisterForm />
        </AuthProvider>
      );

      // Fill in registration form
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'newuser' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'newuser@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      // Check loading state
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Wait for registration to complete
      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
        });
      });

      // Check success state
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('should validate password match', async () => {
      render(
        <AuthProvider>
          <RegisterForm />
        </AuthProvider>
      );

      // Fill in registration form with mismatched passwords
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'newuser' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'newuser@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'differentpassword' },
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      // Check validation error
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      render(
        <AuthProvider>
          <RegisterForm />
        </AuthProvider>
      );

      // Fill in registration form with invalid email
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'newuser' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'invalid-email' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      // Check validation error
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      expect(authService.register).not.toHaveBeenCalled();
    });
  });

  describe('Logout Flow', () => {
    it('should handle successful logout', async () => {
      (authService.getToken as jest.Mock).mockReturnValueOnce('valid-token');
      (authService.logout as jest.Mock).mockResolvedValueOnce(undefined);

      render(
        <AuthProvider>
          <div>
            <button onClick={() => authService.logout()}>Logout</button>
          </div>
        </AuthProvider>
      );

      // Click logout button
      fireEvent.click(screen.getByText(/logout/i));

      // Wait for logout to complete
      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalled();
      });
    });
  });
}); 