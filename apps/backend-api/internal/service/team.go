package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"github.com/schema-platform/backend-api/internal/repository"
	"github.com/schema-platform/backend-api/pkg/errors"
	"gorm.io/gorm"
)

// TeamService handles team operations
type TeamService struct {
	teamRepo *repository.TeamRepository
	userRepo *repository.UserRepository
}

// NewTeamService creates a new team service
func NewTeamService(teamRepo *repository.TeamRepository, userRepo *repository.UserRepository) *TeamService {
	return &TeamService{
		teamRepo: teamRepo,
		userRepo: userRepo,
	}
}

// CreateTeam creates a new team
func (s *TeamService) CreateTeam(ctx context.Context, req *dto.TeamCreateRequest, ownerID string) (*dto.TeamResponse, error) {
	owner, err := uuid.Parse(ownerID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid owner ID")
	}

	// Check if team name already exists
	exists, err := s.teamRepo.ExistsByName(ctx, req.Name)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}
	if exists {
		return nil, errors.NewConflictError("Team name already exists")
	}

	team := &model.Team{
		Name:        req.Name,
		Description: req.Description,
		OwnerID:     owner,
	}

	if err := s.teamRepo.Create(ctx, team); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	// Add owner as admin member
	member := &model.TeamMember{
		TeamID: team.ID,
		UserID: owner,
		Role:   model.UserRoleAdmin,
	}
	if err := s.teamRepo.AddMember(ctx, member); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toTeamResponse(team), nil
}

// GetTeam retrieves a team by ID
func (s *TeamService) GetTeam(ctx context.Context, teamID string) (*dto.TeamResponse, error) {
	id, err := uuid.Parse(teamID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid team ID")
	}

	team, err := s.teamRepo.GetByID(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("Team")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toTeamResponse(team), nil
}

// GetTeams retrieves all teams with pagination
func (s *TeamService) GetTeams(ctx context.Context, params *dto.PaginatedRequest) (*dto.TeamListResponse, error) {
	teams, total, err := s.teamRepo.GetAll(ctx, params)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.TeamResponse, len(teams))
	for i, team := range teams {
		items[i] = *s.toTeamResponse(&team)
	}

	page := params.GetPage()
	pageSize := params.GetPageSize()
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &dto.TeamListResponse{
		Items:      items,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}


// UpdateTeam updates a team
func (s *TeamService) UpdateTeam(ctx context.Context, teamID string, req *dto.TeamUpdateRequest) (*dto.TeamResponse, error) {
	id, err := uuid.Parse(teamID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid team ID")
	}

	team, err := s.teamRepo.GetByID(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("Team")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	if req.Name != nil {
		// Check if new name already exists
		if *req.Name != team.Name {
			exists, err := s.teamRepo.ExistsByName(ctx, *req.Name)
			if err != nil {
				return nil, errors.WrapDatabaseError(err)
			}
			if exists {
				return nil, errors.NewConflictError("Team name already exists")
			}
		}
		team.Name = *req.Name
	}
	if req.Description != nil {
		team.Description = *req.Description
	}

	if err := s.teamRepo.Update(ctx, team); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toTeamResponse(team), nil
}

// DeleteTeam soft deletes a team
func (s *TeamService) DeleteTeam(ctx context.Context, teamID string) error {
	id, err := uuid.Parse(teamID)
	if err != nil {
		return errors.NewValidationError("Invalid team ID")
	}

	exists, err := s.teamRepo.Exists(ctx, id)
	if err != nil {
		return errors.WrapDatabaseError(err)
	}
	if !exists {
		return errors.NewNotFoundError("Team")
	}

	return s.teamRepo.SoftDelete(ctx, id)
}

// AddMember adds a member to a team
func (s *TeamService) AddMember(ctx context.Context, teamID string, req *dto.TeamMemberRequest) (*dto.TeamMemberResponse, error) {
	tID, err := uuid.Parse(teamID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid team ID")
	}

	uID, err := uuid.Parse(req.UserID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid user ID")
	}

	// Check if team exists
	exists, err := s.teamRepo.Exists(ctx, tID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}
	if !exists {
		return nil, errors.NewNotFoundError("Team")
	}

	// Check if user exists
	exists, err = s.userRepo.Exists(ctx, uID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}
	if !exists {
		return nil, errors.NewNotFoundError("User")
	}

	// Check if already a member
	isMember, err := s.teamRepo.IsMember(ctx, tID, uID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}
	if isMember {
		return nil, errors.NewConflictError("User is already a team member")
	}

	member := &model.TeamMember{
		TeamID: tID,
		UserID: uID,
		Role:   model.UserRole(req.Role),
	}

	if err := s.teamRepo.AddMember(ctx, member); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return &dto.TeamMemberResponse{
		UserID:   member.UserID.String(),
		TeamID:   member.TeamID.String(),
		Role:     string(member.Role),
		JoinedAt: member.JoinedAt,
	}, nil
}

// RemoveMember removes a member from a team
func (s *TeamService) RemoveMember(ctx context.Context, teamID, userID string) error {
	tID, err := uuid.Parse(teamID)
	if err != nil {
		return errors.NewValidationError("Invalid team ID")
	}

	uID, err := uuid.Parse(userID)
	if err != nil {
		return errors.NewValidationError("Invalid user ID")
	}

	// Check if member exists
	isMember, err := s.teamRepo.IsMember(ctx, tID, uID)
	if err != nil {
		return errors.WrapDatabaseError(err)
	}
	if !isMember {
		return errors.NewNotFoundError("Team member")
	}

	return s.teamRepo.RemoveMember(ctx, tID, uID)
}

// GetMembers retrieves all members of a team
func (s *TeamService) GetMembers(ctx context.Context, teamID string) ([]dto.TeamMemberResponse, error) {
	id, err := uuid.Parse(teamID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid team ID")
	}

	members, err := s.teamRepo.GetMembers(ctx, id)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	result := make([]dto.TeamMemberResponse, len(members))
	for i, m := range members {
		result[i] = dto.TeamMemberResponse{
			UserID:   m.UserID.String(),
			TeamID:   m.TeamID.String(),
			Role:     string(m.Role),
			JoinedAt: m.JoinedAt,
		}
	}

	return result, nil
}

func (s *TeamService) toTeamResponse(team *model.Team) *dto.TeamResponse {
	return &dto.TeamResponse{
		ID:          team.ID.String(),
		Name:        team.Name,
		Description: team.Description,
		OwnerID:     team.OwnerID.String(),
		CreatedAt:   team.CreatedAt,
		UpdatedAt:   team.UpdatedAt,
	}
}
