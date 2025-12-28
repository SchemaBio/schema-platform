package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// UserRepository handles user data access
type UserRepository struct {
	*BaseRepository[model.User]
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{
		BaseRepository: NewBaseRepository[model.User](db),
	}
}

// GetByEmail retrieves a user by email
func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	err := r.DB().WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// ExistsByEmail checks if a user with the given email exists
func (r *UserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	var count int64
	err := r.DB().WithContext(ctx).Model(&model.User{}).Where("email = ?", email).Count(&count).Error
	return count > 0, err
}

// GetAll retrieves all users with pagination and filtering
func (r *UserRepository) GetAll(ctx context.Context, params *dto.PaginatedRequest) ([]model.User, int64, error) {
	var users []model.User
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.User{})

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
	if err := query.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// GetByIDs retrieves users by their IDs
func (r *UserRepository) GetByIDs(ctx context.Context, ids []uuid.UUID) ([]model.User, error) {
	var users []model.User
	err := r.DB().WithContext(ctx).Where("id IN ?", ids).Find(&users).Error
	return users, err
}

// UpdatePassword updates a user's password hash
func (r *UserRepository) UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error {
	return r.DB().WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Update("password_hash", passwordHash).Error
}

// SetActive sets the active status of a user
func (r *UserRepository) SetActive(ctx context.Context, userID uuid.UUID, isActive bool) error {
	return r.DB().WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Update("is_active", isActive).Error
}

// WithTx returns a new repository with the given transaction
func (r *UserRepository) WithTx(tx *gorm.DB) *UserRepository {
	return &UserRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
