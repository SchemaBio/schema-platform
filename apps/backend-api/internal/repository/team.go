package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// TeamRepository handles team data access
type TeamRepository struct {
	*BaseRepository[model.Team]
}

// NewTeamRepository creates a new team repository
func NewTeamRepository(db *gorm.DB) *TeamRepository {
	return &TeamRepository{
		BaseRepository: NewBaseRepository[model.Team](db),
	}
}

// GetByName retrieves a team by name
func (r *TeamRepository) GetByName(ctx context.Context, name string) (*model.Team, error) {
	var team model.Team
	err := r.DB().WithContext(ctx).Where("name = ?", name).First(&team).Error
	if err != nil {
		return nil, err
	}
	return &team, nil
}

// ExistsByName checks if a team with the given name exists
func (r *TeamRepository) ExistsByName(ctx context.Context, name string) (bool, error) {
	var count int64
	err := r.DB().WithContext(ctx).Model(&model.Team{}).Where("name = ?", name).Count(&count).Error
	return count > 0, err
}

// GetAll retrieves all teams with pagination
func (r *TeamRepository) GetAll(ctx context.Context, params *dto.PaginatedRequest) ([]model.Team, int64, error) {
	var teams []model.Team
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.Team{})

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply sorting
	if params.SortBy != "" {
		order := params.SortBy + " " + params.GetSortOrder()
		query = query.Order(order)
	} else {
		query = query.Order("created_at desc")
	}

	// Apply pagination
	offset := params.GetOffset()
	limit := params.GetPageSize()
	if err := query.Offset(offset).Limit(limit).Find(&teams).Error; err != nil {
		return nil, 0, err
	}

	return teams, total, nil
}

// GetWithMembers retrieves a team with its members
func (r *TeamRepository) GetWithMembers(ctx context.Context, teamID uuid.UUID) (*model.Team, error) {
	var team model.Team
	err := r.DB().WithContext(ctx).Preload("Members").Preload("Members.User").Where("id = ?", teamID).First(&team).Error
	if err != nil {
		return nil, err
	}
	return &team, nil
}

// AddMember adds a user to a team
func (r *TeamRepository) AddMember(ctx context.Context, member *model.TeamMember) error {
	return r.DB().WithContext(ctx).Create(member).Error
}

// RemoveMember removes a user from a team
func (r *TeamRepository) RemoveMember(ctx context.Context, teamID, userID uuid.UUID) error {
	return r.DB().WithContext(ctx).Where("team_id = ? AND user_id = ?", teamID, userID).Delete(&model.TeamMember{}).Error
}

// GetMember retrieves a team member
func (r *TeamRepository) GetMember(ctx context.Context, teamID, userID uuid.UUID) (*model.TeamMember, error) {
	var member model.TeamMember
	err := r.DB().WithContext(ctx).Where("team_id = ? AND user_id = ?", teamID, userID).First(&member).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

// GetMembers retrieves all members of a team
func (r *TeamRepository) GetMembers(ctx context.Context, teamID uuid.UUID) ([]model.TeamMember, error) {
	var members []model.TeamMember
	err := r.DB().WithContext(ctx).Preload("User").Where("team_id = ?", teamID).Find(&members).Error
	return members, err
}

// UpdateMemberRole updates a team member's role
func (r *TeamRepository) UpdateMemberRole(ctx context.Context, teamID, userID uuid.UUID, role model.UserRole) error {
	return r.DB().WithContext(ctx).Model(&model.TeamMember{}).Where("team_id = ? AND user_id = ?", teamID, userID).Update("role", role).Error
}

// IsMember checks if a user is a member of a team
func (r *TeamRepository) IsMember(ctx context.Context, teamID, userID uuid.UUID) (bool, error) {
	var count int64
	err := r.DB().WithContext(ctx).Model(&model.TeamMember{}).Where("team_id = ? AND user_id = ?", teamID, userID).Count(&count).Error
	return count > 0, err
}

// GetUserTeams retrieves all teams a user belongs to
func (r *TeamRepository) GetUserTeams(ctx context.Context, userID uuid.UUID) ([]model.Team, error) {
	var teams []model.Team
	err := r.DB().WithContext(ctx).
		Joins("JOIN team_members ON team_members.team_id = teams.id").
		Where("team_members.user_id = ?", userID).
		Find(&teams).Error
	return teams, err
}

// WithTx returns a new repository with the given transaction
func (r *TeamRepository) WithTx(tx *gorm.DB) *TeamRepository {
	return &TeamRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
