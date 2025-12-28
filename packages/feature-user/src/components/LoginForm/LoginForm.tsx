import { useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { AuthenticationError } from '../../types.js';

/**
 * Login form props
 */
export interface LoginFormProps {
  /** Callback on successful login */
  onSuccess?: () => void;
  /** Callback on login error */
  onError?: (error: Error) => void;
  /** URL to redirect to after login */
  redirectTo?: string;
}

/**
 * Login form component
 */
export function LoginForm({ onSuccess, onError, redirectTo }: LoginFormProps): JSX.Element {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);

      try {
        await login(email, password);
        onSuccess?.();
        if (redirectTo && typeof window !== 'undefined') {
          window.location.href = redirectTo;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Login failed');
        setError(
          err instanceof AuthenticationError
            ? err.message
            : 'Invalid email or password'
        );
        onError?.(error);
      }
    },
    [email, password, login, onSuccess, onError, redirectTo]
  );

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
          placeholder="Enter your email"
          required
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          placeholder="Enter your password"
          required
          disabled={isLoading}
          autoComplete="current-password"
        />
      </div>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
