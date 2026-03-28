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

// OrganizationService handles organization operations
type OrganizationService struct {
	orgRepo  *repository.OrganizationRepository
	userRepo *repository.UserRepository
}

// NewOrganizationService creates a new organization service
func NewOrganizationService(orgRepo *repository.OrganizationRepository, userRepo *repository.UserRepository) *OrganizationService {
	return &OrganizationService{
		orgRepo:  orgRepo,
		userRepo: userRepo,
	}
}

// GetUserOrganizations retrieves all organizations a user belongs to
func (s *OrganizationService) GetUserOrganizations(ctx context.Context, userID string) (*dto.UserOrganizationsResponse, error) {
	uID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid user ID")
	}

	orgs, err := s.orgRepo.GetUserOrganizations(ctx, uID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	// Get membership info for each org
	memberships, err := s.orgRepo.GetUserOrgMemberships(ctx, uID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	// Create a map for quick lookup
	memberMap := make(map[uuid.UUID]model.OrgMember)
	for _, m := range memberships {
		memberMap[m.OrgID] = m
	}

	items := make([]dto.UserOrganizationInfo, len(orgs))
	for i, org := range orgs {
		member := memberMap[org.ID]
		items[i] = dto.UserOrganizationInfo{
			ID:          org.ID.String(),
			Name:        org.Name,
			Slug:        org.Slug,
			Description: org.Description,
			OrgRole:     string(member.OrgRole),
			JoinedAt:    member.JoinedAt,
		}
	}

	return &dto.UserOrganizationsResponse{
		Organizations: items,
	}, nil
}

// GetOrganization retrieves an organization by ID
func (s *OrganizationService) GetOrganization(ctx context.Context, orgID, userID string) (*dto.OrganizationResponse, error) {
	oID, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid organization ID")
	}

	org, err := s.orgRepo.GetByID(ctx, oID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("Organization")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toOrganizationResponse(org), nil
}

// SwitchOrganization switches the user's current organization context
func (s *OrganizationService) SwitchOrganization(ctx context.Context, orgID, userID string) (*dto.OrganizationResponse, error) {
	oID, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid organization ID")
	}

	uID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid user ID")
	}

	// Verify user is a member of this organization
	isMember, err := s.orgRepo.IsMember(ctx, oID, uID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}
	if !isMember {
		return nil, errors.NewForbiddenError("You are not a member of this organization")
	}

	org, err := s.orgRepo.GetByID(ctx, oID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	// Update user's primary org
	user, err := s.userRepo.GetByID(ctx, uID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}
	user.PrimaryOrgID = &oID
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toOrganizationResponse(org), nil
}

// GetOrganizationMembers retrieves all members of an organization
func (s *OrganizationService) GetOrganizationMembers(ctx context.Context, orgID string) ([]dto.OrgMemberResponse, error) {
	oID, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid organization ID")
	}

	members, err := s.orgRepo.GetMembers(ctx, oID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	result := make([]dto.OrgMemberResponse, len(members))
	for i, m := range members {
		result[i] = dto.OrgMemberResponse{
			UserID:   m.UserID.String(),
			OrgID:    m.OrgID.String(),
			OrgRole:  string(m.OrgRole),
			JoinedAt: m.JoinedAt,
		}
		if m.User != nil {
			result[i].UserName = m.User.Name
			result[i].UserEmail = m.User.Email
		}
	}

	return result, nil
}

// AddMember adds a member to an organization
func (s *OrganizationService) AddMember(ctx context.Context, orgID string, req *dto.OrgMemberRequest, invitedBy string) (*dto.OrgMemberResponse, error) {
	oID, err := uuid.Parse(orgID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid organization ID")
	}

	uID, err := uuid.Parse(req.UserID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid user ID")
	}

	inviterID, err := uuid.Parse(invitedBy)
	if err != nil {
		return nil, errors.NewValidationError("Invalid inviter ID")
	}

	// Check if organization exists
	exists, err := s.orgRepo.Exists(ctx, oID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}
	if !exists {
		return nil, errors.NewNotFoundError("Organization")
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
	isMember, err := s.orgRepo.IsMember(ctx, oID, uID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}
	if isMember {
		return nil, errors.NewConflictError("User is already an organization member")
	}

	member := &model.OrgMember{
		UserID:    uID,
		OrgID:     oID,
		OrgRole:   model.OrgRole(req.OrgRole),
		InvitedBy: inviterID,
	}

	if err := s.orgRepo.AddMember(ctx, member); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return &dto.OrgMemberResponse{
		UserID:   member.UserID.String(),
		OrgID:    member.OrgID.String(),
		OrgRole:  string(member.OrgRole),
		JoinedAt: member.JoinedAt,
	}, nil
}

// RemoveMember removes a member from an organization
func (s *OrganizationService) RemoveMember(ctx context.Context, orgID, userID string) error {
	oID, err := uuid.Parse(orgID)
	if err != nil {
		return errors.NewValidationError("Invalid organization ID")
	}

	uID, err := uuid.Parse(userID)
	if err != nil {
		return errors.NewValidationError("Invalid user ID")
	}

	// Check if member exists
	isMember, err := s.orgRepo.IsMember(ctx, oID, uID)
	if err != nil {
		return errors.WrapDatabaseError(err)
	}
	if !isMember {
		return errors.NewNotFoundError("Organization member")
	}

	return s.orgRepo.RemoveMember(ctx, oID, uID)
}

// UpdateMemberRole updates a member's role in an organization
func (s *OrganizationService) UpdateMemberRole(ctx context.Context, orgID, userID string, req *dto.OrgMemberRoleUpdateRequest) error {
	oID, err := uuid.Parse(orgID)
	if err != nil {
		return errors.NewValidationError("Invalid organization ID")
	}

	uID, err := uuid.Parse(userID)
	if err != nil {
		return errors.NewValidationError("Invalid user ID")
	}

	// Check if member exists
	member, err := s.orgRepo.GetMember(ctx, oID, uID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.NewNotFoundError("Organization member")
		}
		return errors.WrapDatabaseError(err)
	}

	// Cannot change owner's role
	if member.OrgRole == model.OrgRoleOwner {
		return errors.NewForbiddenError("Cannot change organization owner's role")
	}

	return s.orgRepo.UpdateMemberRole(ctx, oID, uID, model.OrgRole(req.OrgRole))
}

func (s *OrganizationService) toOrganizationResponse(org *model.Organization) *dto.OrganizationResponse {
	return &dto.OrganizationResponse{
		ID:          org.ID.String(),
		Name:        org.Name,
		Slug:        org.Slug,
		Description: org.Description,
		Status:      string(org.Status),
		Plan:        string(org.Plan),
		MaxUsers:    org.MaxUsers,
		CreatedAt:   org.CreatedAt,
		UpdatedAt:   org.UpdatedAt,
	}
}