import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import type { Team } from '@schema/types';

/**
 * Team selector props
 */
export interface TeamSelectorProps {
  /** Currently selected team ID */
  value?: string;
  /** Callback when team selection changes */
  onChange?: (teamId: string) => void;
  /** Available teams */
  teams: Team[];
  /** Whether selector is loading */
  isLoading?: boolean;
  /** Whether selector is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Team selector component for switching between teams
 */
export function TeamSelector({
  value,
  onChange,
  teams,
  isLoading = false,
  disabled = false,
  placeholder = 'Select a team',
}: TeamSelectorProps): JSX.Element {
  /**
   * Handle selection change
   */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    },
    [onChange]
  );

  if (isLoading) {
    return (
      <div className="team-selector team-selector--loading">
        <span className="team-selector__loading-text">Loading teams...</span>
      </div>
    );
  }

  return (
    <div className="team-selector">
      <select
        className="team-selector__select"
        value={value || ''}
        onChange={handleChange}
        disabled={disabled || teams.length === 0}
        aria-label="Select team"
      >
        <option value="" disabled>
          {teams.length === 0 ? 'No teams available' : placeholder}
        </option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </div>
  );
}
