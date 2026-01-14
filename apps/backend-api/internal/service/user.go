package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"github.com/schema-platform/backend-api/internal/pkg/hash"
	"github.com/schema-platform/backend-api/internal/repository"
	"github.com/schema-platform/backend-api/pkg/errors"
	"gorm.io/gorm"
)

// UserService handles user operations
type UserService struct {
	userRepo *repository.UserRepository
}

// NewUserService creates a new user service
func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

// CreateUser creates a new user
func (s *UserService) CreateUser(ctx context.Context, req *dto.UserCreateRequest) (*dto.UserResponse, error) {
	// Check if email already exists
	exists, err := s.userRepo.ExistsByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}
	if exists {
		return nil, errors.NewConflictError("Email already exists")
	}

	// Hash password
	passwordHash, err := hash.HashPassword(req.Password)
	if err != nil {
		return nil, errors.NewInternalError("Failed to hash password")
	}

	// Set default role if not provided
	role := model.UserRoleViewer
	if req.Role != "" {
		role = model.UserRole(req.Role)
	}

	// Create user
	user := &model.User{
		Email:        req.Email,
		Name:         req.Name,
		PasswordHash: passwordHash,
		Role:         role,
		IsActive:     true,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toUserResponse(user), nil
}

// GetUser retrieves a user by ID
func (s *UserService) GetUser(ctx context.Context, userID string) (*dto.UserResponse, error) {
	id, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid user ID")
	}

	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("User")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toUserResponse(user), nil
}

// GetUsers retrieves all users with pagination
func (s *UserService) GetUsers(ctx context.Context, params *dto.PaginatedRequest) (*dto.UserListResponse, error) {
	users, total, err := s.userRepo.GetAll(ctx, params)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.UserResponse, len(users))
	for i, user := range users {
		items[i] = *s.toUserResponse(&user)
	}

	page := params.GetPage()
	pageSize := params.GetPageSize()
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &dto.UserListResponse{
		Items:      items,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// UpdateUser updates a user
func (s *UserService) UpdateUser(ctx context.Context, userID string, req *dto.UserUpdateRequest) (*dto.UserResponse, error) {
	id, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid user ID")
	}

	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("User")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	// Update fields
	if req.Name != nil {
		user.Name = *req.Name
	}
	if req.Role != nil {
		user.Role = model.UserRole(*req.Role)
	}

	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toUserResponse(user), nil
}

// DeleteUser soft deletes a user
func (s *UserService) DeleteUser(ctx context.Context, userID string) error {
	id, err := uuid.Parse(userID)
	if err != nil {
		return errors.NewValidationError("Invalid user ID")
	}

	// Check if user exists
	exists, err := s.userRepo.Exists(ctx, id)
	if err != nil {
		return errors.WrapDatabaseError(err)
	}
	if !exists {
		return errors.NewNotFoundError("User")
	}

	if err := s.userRepo.SoftDelete(ctx, id); err != nil {
		return errors.WrapDatabaseError(err)
	}

	return nil
}

// GetUserByEmail retrieves a user by email
func (s *UserService) GetUserByEmail(ctx context.Context, email string) (*dto.UserResponse, error) {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("User")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toUserResponse(user), nil
}

// ActivateUser activates a user account
func (s *UserService) ActivateUser(ctx context.Context, userID string) error {
	id, err := uuid.Parse(userID)
	if err != nil {
		return errors.NewValidationError("Invalid user ID")
	}

	// Check if user exists
	exists, err := s.userRepo.Exists(ctx, id)
	if err != nil {
		return errors.WrapDatabaseError(err)
	}
	if !exists {
		return errors.NewNotFoundError("User")
	}

	if err := s.userRepo.SetActive(ctx, id, true); err != nil {
		return errors.WrapDatabaseError(err)
	}

	return nil
}

// DeactivateUser deactivates a user account
func (s *UserService) DeactivateUser(ctx context.Context, userID string) error {
	id, err := uuid.Parse(userID)
	if err != nil {
		return errors.NewValidationError("Invalid user ID")
	}

	// Check if user exists
	exists, err := s.userRepo.Exists(ctx, id)
	if err != nil {
		return errors.WrapDatabaseError(err)
	}
	if !exists {
		return errors.NewNotFoundError("User")
	}

	if err := s.userRepo.SetActive(ctx, id, false); err != nil {
		return errors.WrapDatabaseError(err)
	}

	return nil
}

// ChangePassword changes a user's password
func (s *UserService) ChangePassword(ctx context.Context, userID string, req *dto.ChangePasswordRequest) error {
	id, err := uuid.Parse(userID)
	if err != nil {
		return errors.NewValidationError("Invalid user ID")
	}

	// Get user
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.NewNotFoundError("User")
		}
		return errors.WrapDatabaseError(err)
	}

	// Verify current password
	if !hash.VerifyPassword(req.CurrentPassword, user.PasswordHash) {
		return errors.NewUnauthorizedError("Current password is incorrect")
	}

	// Hash new password
	newPasswordHash, err := hash.HashPassword(req.NewPassword)
	if err != nil {
		return errors.NewInternalError("Failed to hash password")
	}

	// Update password
	if err := s.userRepo.UpdatePassword(ctx, id, newPasswordHash); err != nil {
		return errors.WrapDatabaseError(err)
	}

	return nil
}

// ResetPassword resets a user's password (admin only)
func (s *UserService) ResetPassword(ctx context.Context, userID string, req *dto.ResetPasswordRequest) error {
	id, err := uuid.Parse(userID)
	if err != nil {
		return errors.NewValidationError("Invalid user ID")
	}

	// Check if user exists
	exists, err := s.userRepo.Exists(ctx, id)
	if err != nil {
		return errors.WrapDatabaseError(err)
	}
	if !exists {
		return errors.NewNotFoundError("User")
	}

	// Hash new password
	newPasswordHash, err := hash.HashPassword(req.NewPassword)
	if err != nil {
		return errors.NewInternalError("Failed to hash password")
	}

	// Update password
	if err := s.userRepo.UpdatePassword(ctx, id, newPasswordHash); err != nil {
		return errors.WrapDatabaseError(err)
	}

	return nil
}

// toUserResponse converts a user model to a response DTO
func (s *UserService) toUserResponse(user *model.User) *dto.UserResponse {
	return &dto.UserResponse{
		ID:        user.ID.String(),
		Email:     user.Email,
		Name:      user.Name,
		Role:      string(user.Role),
		IsActive:  user.IsActive,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}
