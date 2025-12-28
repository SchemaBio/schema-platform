import { useState, useCallback } from 'react';
import type { TeamMember, UserRole } from '@schema/types';

/**
 * Team management props
 */
export interface TeamManagementProps {
  /** Team ID */
  teamId: string;
  /** Team members */
  members: TeamMember[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Callback when member is added */
  onAddMember?: (userId: string, role: UserRole) => Promise<void>;
  /** Callback when member is removed */
  onRemoveMember?: (userId: string) => Promise<void>;
  /** Callback when member role is changed */
  onUpdateRole?: (userId: string, role: UserRole) => Promise<void>;
  /** Callback when members change */
  onMemberChange?: () => void;
  /** Available roles */
  availableRoles?: UserRole[];
}

/**
 * Team management component for team administration
 */
export function TeamManagement({
  teamId: _teamId,
  members,
  isLoading = false,
  onAddMember,
  onRemoveMember,
  onUpdateRole,
  onMemberChange,
  availableRoles = ['ADMIN', 'DOCTOR', 'ANALYST', 'VIEWER'] as UserRole[],
}: TeamManagementProps): JSX.Element {
  // _teamId is available for future use (e.g., API calls)
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('VIEWER' as UserRole);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle add member
   */
  const handleAddMember = useCallback(async () => {
    if (!newMemberEmail.trim()) {
      setError('Please enter a user email or ID');
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      await onAddMember?.(newMemberEmail.trim(), newMemberRole);
      setNewMemberEmail('');
      onMemberChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setIsAdding(false);
    }
  }, [newMemberEmail, newMemberRole, onAddMember, onMemberChange]);

  /**
   * Handle remove member
   */
  const handleRemoveMember = useCallback(
    async (userId: string) => {
      if (!confirm('Are you sure you want to remove this member?')) {
        return;
      }

      try {
        await onRemoveMember?.(userId);
        onMemberChange?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove member');
      }
    },
    [onRemoveMember, onMemberChange]
  );

  /**
   * Handle role change
   */
  const handleRoleChange = useCallback(
    async (userId: string, role: UserRole) => {
      try {
        await onUpdateRole?.(userId, role);
        onMemberChange?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update role');
      }
    },
    [onUpdateRole, onMemberChange]
  );

  if (isLoading) {
    return (
      <div className="team-management team-management--loading">
        <span>Loading team members...</span>
      </div>
    );
  }

  return (
    <div className="team-management">
      {/* Add Member Section */}
      <div className="team-management__add-member">
        <h3 className="team-management__subtitle">Add Member</h3>

        <div className="team-management__add-form">
          <input
            type="text"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            placeholder="User email or ID"
            className="form-input"
            disabled={isAdding}
          />

          <select
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
            className="form-select"
            disabled={isAdding}
          >
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAddMember}
            className="btn btn-primary"
            disabled={isAdding}
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
      </div>

      {/* Members List */}
      <div className="team-management__members">
        <h3 className="team-management__subtitle">
          Members ({members.length})
        </h3>

        {members.length === 0 ? (
          <p className="team-management__empty">No members in this team.</p>
        ) : (
          <table className="team-management__table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.userId}>
                  <td>{member.userId}</td>
                  <td>
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.userId, e.target.value as UserRole)
                      }
                      className="form-select form-select--small"
                    >
                      {availableRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(member.joinedAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.userId)}
                      className="btn btn-danger btn-small"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
