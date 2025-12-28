import { useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { validatePassword, validateEmailFormat } from '../../utils/validation.js';

/**
 * User settings props
 */
export interface UserSettingsProps {
  /** Callback on save */
  onSave?: () => void;
  /** API base URL for user service */
  apiBaseUrl?: string;
}

/**
 * User settings component for profile management
 */
export function UserSettings({ onSave, apiBaseUrl: _apiBaseUrl }: UserSettingsProps): JSX.Element {
  // _apiBaseUrl is available for future use when integrating with user service
  const { user } = useAuth();

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  /**
   * Handle profile update
   */
  const handleProfileSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setProfileError(null);
      setProfileSuccess(false);

      // Validate email
      const emailValidation = validateEmailFormat(email);
      if (!emailValidation.valid) {
        setProfileError(emailValidation.error || 'Invalid email');
        return;
      }

      setIsUpdatingProfile(true);

      try {
        // TODO: Call user service to update profile
        // await userService.updateUser(user.id, { name, email });
        setProfileSuccess(true);
        onSave?.();
      } catch (err) {
        setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
      } finally {
        setIsUpdatingProfile(false);
      }
    },
    [name, email, onSave]
  );

  /**
   * Handle password change
   */
  const handlePasswordSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setPasswordError(null);
      setPasswordSuccess(false);

      // Validate new password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        setPasswordError(passwordValidation.errors.join('. '));
        return;
      }

      // Check password confirmation
      if (newPassword !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }

      setIsUpdatingPassword(true);

      try {
        // TODO: Call user service to change password
        // await userService.changePassword(user.id, { currentPassword, newPassword });
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (err) {
        setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
      } finally {
        setIsUpdatingPassword(false);
      }
    },
    [currentPassword, newPassword, confirmPassword]
  );

  if (!user) {
    return <div className="user-settings user-settings--empty">Please log in to view settings.</div>;
  }

  return (
    <div className="user-settings">
      {/* Profile Section */}
      <section className="user-settings__section">
        <h2 className="user-settings__title">Profile</h2>

        <form onSubmit={handleProfileSubmit} className="user-settings__form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
              disabled={isUpdatingProfile}
            />
          </div>

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
              required
              disabled={isUpdatingProfile}
            />
          </div>

          {profileError && (
            <div className="form-error" role="alert">
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="form-success" role="status">
              Profile updated successfully
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isUpdatingProfile}
          >
            {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </section>

      {/* Password Section */}
      <section className="user-settings__section">
        <h2 className="user-settings__title">Change Password</h2>

        <form onSubmit={handlePasswordSubmit} className="user-settings__form">
          <div className="form-group">
            <label htmlFor="currentPassword" className="form-label">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="form-input"
              required
              disabled={isUpdatingPassword}
              autoComplete="current-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input"
              required
              disabled={isUpdatingPassword}
              autoComplete="new-password"
            />
            <p className="form-hint">
              At least 8 characters, with uppercase, lowercase, and a number
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              required
              disabled={isUpdatingPassword}
              autoComplete="new-password"
            />
          </div>

          {passwordError && (
            <div className="form-error" role="alert">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="form-success" role="status">
              Password changed successfully
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isUpdatingPassword}
          >
            {isUpdatingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </section>
    </div>
  );
}
