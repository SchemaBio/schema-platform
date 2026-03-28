package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// OrganizationRepository handles organization data access
type OrganizationRepository struct {
	*BaseRepository[model.Organization]
}

// NewOrganizationRepository creates a new organization repository
func NewOrganizationRepository(db *gorm.DB) *OrganizationRepository {
	return &OrganizationRepository{
		BaseRepository: NewBaseRepository[model.Organization](db),
	}
}

// GetBySlug retrieves an organization by slug
func (r *OrganizationRepository) GetBySlug(ctx context.Context, slug string) (*model.Organization, error) {
	var org model.Organization
	err := r.DB().WithContext(ctx).Where("slug = ?", slug).First(&org).Error
	if err != nil {
		return nil, err
	}
	return &org, nil
}

// ExistsBySlug checks if an organization with the given slug exists
func (r *OrganizationRepository) ExistsBySlug(ctx context.Context, slug string) (bool, error) {
	var count int64
	err := r.DB().WithContext(ctx).Model(&model.Organization{}).Where("slug = ?", slug).Count(&count).Error
	return count > 0, err
}

// GetUserOrganizations retrieves all organizations a user belongs to
func (r *OrganizationRepository) GetUserOrganizations(ctx context.Context, userID uuid.UUID) ([]model.Organization, error) {
	var orgs []model.Organization
	err := r.DB().WithContext(ctx).
		Joins("JOIN org_members ON org_members.org_id = organizations.id").
		Where("org_members.user_id = ?", userID).
		Find(&orgs).Error
	return orgs, err
}

// GetWithMembers retrieves an organization with its members
func (r *OrganizationRepository) GetWithMembers(ctx context.Context, orgID uuid.UUID) (*model.Organization, error) {
	var org model.Organization
	err := r.DB().WithContext(ctx).Preload("Members").Preload("Members.User").Where("id = ?", orgID).First(&org).Error
	if err != nil {
		return nil, err
	}
	return &org, nil
}

// AddMember adds a user to an organization
func (r *OrganizationRepository) AddMember(ctx context.Context, member *model.OrgMember) error {
	return r.DB().WithContext(ctx).Create(member).Error
}

// RemoveMember removes a user from an organization
func (r *OrganizationRepository) RemoveMember(ctx context.Context, orgID, userID uuid.UUID) error {
	return r.DB().WithContext(ctx).Where("org_id = ? AND user_id = ?", orgID, userID).Delete(&model.OrgMember{}).Error
}

// GetMember retrieves an organization member
func (r *OrganizationRepository) GetMember(ctx context.Context, orgID, userID uuid.UUID) (*model.OrgMember, error) {
	var member model.OrgMember
	err := r.DB().WithContext(ctx).Where("org_id = ? AND user_id = ?", orgID, userID).First(&member).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

// GetMembers retrieves all members of an organization
func (r *OrganizationRepository) GetMembers(ctx context.Context, orgID uuid.UUID) ([]model.OrgMember, error) {
	var members []model.OrgMember
	err := r.DB().WithContext(ctx).Preload("User").Where("org_id = ?", orgID).Find(&members).Error
	return members, err
}

// UpdateMemberRole updates an organization member's role
func (r *OrganizationRepository) UpdateMemberRole(ctx context.Context, orgID, userID uuid.UUID, role model.OrgRole) error {
	return r.DB().WithContext(ctx).Model(&model.OrgMember{}).Where("org_id = ? AND user_id = ?", orgID, userID).Update("org_role", role).Error
}

// IsMember checks if a user is a member of an organization
func (r *OrganizationRepository) IsMember(ctx context.Context, orgID, userID uuid.UUID) (bool, error) {
	var count int64
	err := r.DB().WithContext(ctx).Model(&model.OrgMember{}).Where("org_id = ? AND user_id = ?", orgID, userID).Count(&count).Error
	return count > 0, err
}

// GetMemberCount returns the number of members in an organization
func (r *OrganizationRepository) GetMemberCount(ctx context.Context, orgID uuid.UUID) (int64, error) {
	var count int64
	err := r.DB().WithContext(ctx).Model(&model.OrgMember{}).Where("org_id = ?", orgID).Count(&count).Error
	return count, err
}

// GetUserOrgMembership retrieves a user's membership in an organization
func (r *OrganizationRepository) GetUserOrgMembership(ctx context.Context, userID, orgID uuid.UUID) (*model.OrgMember, error) {
	var member model.OrgMember
	err := r.DB().WithContext(ctx).Where("user_id = ? AND org_id = ?", userID, orgID).First(&member).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

// GetUserOrgMemberships retrieves all organization memberships for a user
func (r *OrganizationRepository) GetUserOrgMemberships(ctx context.Context, userID uuid.UUID) ([]model.OrgMember, error) {
	var members []model.OrgMember
	err := r.DB().WithContext(ctx).Preload("Org").Where("user_id = ?", userID).Find(&members).Error
	return members, err
}

// GetAll retrieves all organizations with pagination (for super admin)
func (r *OrganizationRepository) GetAll(ctx context.Context, params *dto.PaginatedRequest) ([]model.Organization, int64, error) {
	var orgs []model.Organization
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.Organization{})

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
	if err := query.Offset(offset).Limit(limit).Find(&orgs).Error; err != nil {
		return nil, 0, err
	}

	return orgs, total, nil
}

// WithTx returns a new repository with the given transaction
func (r *OrganizationRepository) WithTx(tx *gorm.DB) *OrganizationRepository {
	return &OrganizationRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}