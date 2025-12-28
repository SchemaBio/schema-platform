import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Team, TeamMember, UserRole } from '@schema/types';
import { createTeamService } from '../services/team.service.js';
import type { TeamService } from '../services/team.service.js';

/**
 * Team hook return type
 */
export interface UseTeamReturn {
  /** Current team */
  team: Team | null;
  /** Team members */
  members: TeamMember[];
  /** Whether data is loading */
  isLoading: boolean;
  /** Last error */
  error: Error | null;
  /** Add member to team */
  addMember: (userId: string, role: UserRole) => Promise<void>;
  /** Remove member from team */
  removeMember: (userId: string) => Promise<void>;
  /** Update member role */
  updateMemberRole: (userId: string, role: UserRole) => Promise<void>;
  /** Refresh team data */
  refresh: () => Promise<void>;
}

/**
 * Hook for team operations
 * @param apiBaseUrl - Base URL for team API
 * @param teamId - Team ID to load (optional)
 * @returns Team state and methods
 */
export function useTeam(apiBaseUrl: string, teamId?: string): UseTeamReturn {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create team service
  const teamService = useMemo<TeamService>(() => {
    return createTeamService(apiBaseUrl, () => null); // Token will be handled by interceptor
  }, [apiBaseUrl]);

  /**
   * Load team and members
   */
  const loadTeam = useCallback(async () => {
    if (!teamId) {
      setTeam(null);
      setMembers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [teamData, membersData] = await Promise.all([
        teamService.getTeam(teamId),
        teamService.getTeamMembers(teamId),
      ]);
      setTeam(teamData);
      setMembers(membersData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load team');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [teamId, teamService]);

  /**
   * Add member to team
   */
  const addMember = useCallback(
    async (userId: string, role: UserRole) => {
      if (!teamId) {
        throw new Error('No team selected');
      }

      try {
        const newMember = await teamService.addMember(teamId, userId, role);
        setMembers((prev) => [...prev, newMember]);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to add member');
        setError(error);
        throw error;
      }
    },
    [teamId, teamService]
  );

  /**
   * Remove member from team
   */
  const removeMember = useCallback(
    async (userId: string) => {
      if (!teamId) {
        throw new Error('No team selected');
      }

      try {
        await teamService.removeMember(teamId, userId);
        setMembers((prev) => prev.filter((m) => m.userId !== userId));
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to remove member');
        setError(error);
        throw error;
      }
    },
    [teamId, teamService]
  );

  /**
   * Update member role
   */
  const updateMemberRole = useCallback(
    async (userId: string, role: UserRole) => {
      if (!teamId) {
        throw new Error('No team selected');
      }

      try {
        const updatedMember = await teamService.updateMemberRole(teamId, userId, role);
        setMembers((prev) =>
          prev.map((m) => (m.userId === userId ? updatedMember : m))
        );
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update member role');
        setError(error);
        throw error;
      }
    },
    [teamId, teamService]
  );

  // Load team on mount or when teamId changes
  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  return {
    team,
    members,
    isLoading,
    error,
    addMember,
    removeMember,
    updateMemberRole,
    refresh: loadTeam,
  };
}

/**
 * Hook for listing user's teams
 */
export interface UseMyTeamsReturn {
  /** User's teams */
  teams: Team[];
  /** Whether data is loading */
  isLoading: boolean;
  /** Last error */
  error: Error | null;
  /** Refresh teams list */
  refresh: () => Promise<void>;
}

/**
 * Hook for listing current user's teams
 * @param apiBaseUrl - Base URL for team API
 * @returns Teams list and methods
 */
export function useMyTeams(apiBaseUrl: string): UseMyTeamsReturn {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create team service
  const teamService = useMemo<TeamService>(() => {
    return createTeamService(apiBaseUrl, () => null);
  }, [apiBaseUrl]);

  /**
   * Load user's teams
   */
  const loadTeams = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const teamsData = await teamService.getMyTeams();
      setTeams(teamsData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load teams');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [teamService]);

  // Load teams on mount
  useEffect(() => {
    void loadTeams();
  }, [loadTeams]);

  return {
    teams,
    isLoading,
    error,
    refresh: loadTeams,
  };
}
