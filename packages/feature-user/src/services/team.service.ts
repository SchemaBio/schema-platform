import type { Team, TeamMember, UserRole } from '@schema/types';
import type { CreateTeamRequest, UpdateTeamRequest } from '../types.js';
import { AuthorizationError } from '../types.js';

/**
 * Team service interface
 */
export interface TeamService {
  getMyTeams(): Promise<Team[]>;
  getTeam(teamId: string): Promise<Team>;
  createTeam(data: CreateTeamRequest): Promise<Team>;
  updateTeam(teamId: string, data: UpdateTeamRequest): Promise<Team>;
  deleteTeam(teamId: string): Promise<void>;
  getTeamMembers(teamId: string): Promise<TeamMember[]>;
  addMember(teamId: string, userId: string, role: UserRole): Promise<TeamMember>;
  removeMember(teamId: string, userId: string): Promise<void>;
  updateMemberRole(teamId: string, userId: string, role: UserRole): Promise<TeamMember>;
}

/**
 * Create team service instance
 */
export function createTeamService(baseUrl: string, getAccessToken: () => string | null): TeamService {
  /**
   * Get authorization headers
   */
  function getHeaders(): HeadersInit {
    const token = getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Handle API errors
   */
  async function handleError(response: Response, defaultMessage: string): Promise<never> {
    const error = await response.json().catch(() => ({}));
    
    if (response.status === 403) {
      throw new AuthorizationError(
        error.message || 'Permission denied',
        error.resource || 'team',
        error.permission || 'ADMIN'
      );
    }
    
    throw new Error(error.message || defaultMessage);
  }

  /**
   * Get teams for current user
   */
  async function getMyTeams(): Promise<Team[]> {
    const response = await fetch(`${baseUrl}/teams/me`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      await handleError(response, 'Failed to fetch teams');
    }

    return response.json() as Promise<Team[]>;
  }

  /**
   * Get team by ID
   */
  async function getTeam(teamId: string): Promise<Team> {
    const response = await fetch(`${baseUrl}/teams/${teamId}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      await handleError(response, 'Failed to fetch team');
    }

    return response.json() as Promise<Team>;
  }

  /**
   * Create new team
   */
  async function createTeam(data: CreateTeamRequest): Promise<Team> {
    const response = await fetch(`${baseUrl}/teams`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await handleError(response, 'Failed to create team');
    }

    return response.json() as Promise<Team>;
  }

  /**
   * Update team
   */
  async function updateTeam(teamId: string, data: UpdateTeamRequest): Promise<Team> {
    const response = await fetch(`${baseUrl}/teams/${teamId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await handleError(response, 'Failed to update team');
    }

    return response.json() as Promise<Team>;
  }

  /**
   * Delete team
   */
  async function deleteTeam(teamId: string): Promise<void> {
    const response = await fetch(`${baseUrl}/teams/${teamId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      await handleError(response, 'Failed to delete team');
    }
  }

  /**
   * Get team members
   */
  async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const response = await fetch(`${baseUrl}/teams/${teamId}/members`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      await handleError(response, 'Failed to fetch team members');
    }

    return response.json() as Promise<TeamMember[]>;
  }

  /**
   * Add member to team
   */
  async function addMember(teamId: string, userId: string, role: UserRole): Promise<TeamMember> {
    const response = await fetch(`${baseUrl}/teams/${teamId}/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, role }),
    });

    if (!response.ok) {
      await handleError(response, 'Failed to add team member');
    }

    return response.json() as Promise<TeamMember>;
  }

  /**
   * Remove member from team
   */
  async function removeMember(teamId: string, userId: string): Promise<void> {
    const response = await fetch(`${baseUrl}/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      
      // Check for last owner error
      if (error.code === 'LAST_OWNER') {
        throw new Error('Cannot remove the last owner from the team');
      }
      
      await handleError(response, 'Failed to remove team member');
    }
  }

  /**
   * Update member role
   */
  async function updateMemberRole(teamId: string, userId: string, role: UserRole): Promise<TeamMember> {
    const response = await fetch(`${baseUrl}/teams/${teamId}/members/${userId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      
      // Check for last owner error
      if (error.code === 'LAST_OWNER') {
        throw new Error('Cannot demote the last owner of the team');
      }
      
      await handleError(response, 'Failed to update member role');
    }

    return response.json() as Promise<TeamMember>;
  }

  return {
    getMyTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    getTeamMembers,
    addMember,
    removeMember,
    updateMemberRole,
  };
}
