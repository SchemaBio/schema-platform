package service

import (
	"context"

	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"github.com/schema-platform/backend-api/internal/pkg/hash"
	"github.com/schema-platform/backend-api/internal/pkg/jwt"
	"github.com/schema-platform/backend-api/internal/repository"
	"github.com/schema-platform/backend-api/pkg/errors"
)

// AuthService handles authentication operations
type AuthService struct {
	userRepo   *repository.UserRepository
	jwtManager *jwt.Manager
}

// NewAuthService creates a new auth service
func NewAuthService(userRepo *repository.UserRepository, jwtManager *jwt.Manager) *AuthService {
	return &AuthService{
		userRepo:   userRepo,
		jwtManager: jwtManager,
	}
}

// Register registers a new user and returns tokens
func (s *AuthService) Register(ctx context.Context, req *dto.RegisterRequest) (*dto.LoginResponse, error) {
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

	// Create user with default role
	user := &model.User{
		Email:        req.Email,
		Name:         req.Name,
		PasswordHash: passwordHash,
		Role:         model.UserRoleViewer, // Default role for self-registration
		IsActive:     true,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	// Generate tokens
	accessToken, expiresAt, err := s.jwtManager.GenerateAccessToken(user.ID.String(), user.Email, string(user.Role))
	if err != nil {
		return nil, errors.NewInternalError("Failed to generate access token")
	}

	refreshToken, _, err := s.jwtManager.GenerateRefreshToken(user.ID.String(), user.Email, string(user.Role))
	if err != nil {
		return nil, errors.NewInternalError("Failed to generate refresh token")
	}

	return &dto.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    expiresAt,
		User: dto.UserResponse{
			ID:        user.ID.String(),
			Email:     user.Email,
			Name:      user.Name,
			Role:      string(user.Role),
			IsActive:  user.IsActive,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		},
	}, nil
}

// Login authenticates a user and returns tokens
func (s *AuthService) Login(ctx context.Context, req *dto.LoginRequest) (*dto.LoginResponse, error) {
	// Find user by email
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.NewUnauthorizedError("Invalid email or password")
	}

	// Check if user is active
	if !user.IsActive {
		return nil, errors.NewUnauthorizedError("Account is disabled")
	}

	// Verify password
	if !hash.VerifyPassword(req.Password, user.PasswordHash) {
		return nil, errors.NewUnauthorizedError("Invalid email or password")
	}

	// Generate tokens
	accessToken, expiresAt, err := s.jwtManager.GenerateAccessToken(user.ID.String(), user.Email, string(user.Role))
	if err != nil {
		return nil, errors.NewInternalError("Failed to generate access token")
	}

	refreshToken, _, err := s.jwtManager.GenerateRefreshToken(user.ID.String(), user.Email, string(user.Role))
	if err != nil {
		return nil, errors.NewInternalError("Failed to generate refresh token")
	}

	return &dto.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    expiresAt,
		User: dto.UserResponse{
			ID:        user.ID.String(),
			Email:     user.Email,
			Name:      user.Name,
			Role:      string(user.Role),
			IsActive:  user.IsActive,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		},
	}, nil
}

// RefreshToken refreshes an access token using a refresh token
func (s *AuthService) RefreshToken(ctx context.Context, req *dto.RefreshRequest) (*dto.AuthToken, error) {
	// Validate refresh token
	claims, err := s.jwtManager.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		if err == jwt.ErrExpiredToken {
			return nil, errors.NewUnauthorizedError("Refresh token has expired")
		}
		return nil, errors.NewUnauthorizedError("Invalid refresh token")
	}

	// Generate new access token
	accessToken, expiresAt, err := s.jwtManager.GenerateAccessToken(claims.UserID, claims.Email, claims.Role)
	if err != nil {
		return nil, errors.NewInternalError("Failed to generate access token")
	}

	// Generate new refresh token
	refreshToken, _, err := s.jwtManager.GenerateRefreshToken(claims.UserID, claims.Email, claims.Role)
	if err != nil {
		return nil, errors.NewInternalError("Failed to generate refresh token")
	}

	return &dto.AuthToken{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    expiresAt,
	}, nil
}

// VerifyToken verifies an access token and returns the payload
func (s *AuthService) VerifyToken(ctx context.Context, token string) (*dto.TokenPayload, error) {
	claims, err := s.jwtManager.ValidateAccessToken(token)
	if err != nil {
		if err == jwt.ErrExpiredToken {
			return nil, errors.NewUnauthorizedError("Token has expired")
		}
		return nil, errors.NewUnauthorizedError("Invalid token")
	}

	return &dto.TokenPayload{
		UserID: claims.UserID,
		Email:  claims.Email,
		Role:   claims.Role,
	}, nil
}

// Logout invalidates a user's session (placeholder for token blacklisting)
func (s *AuthService) Logout(ctx context.Context, userID string) error {
	// In a production system, you would:
	// 1. Add the token to a blacklist (Redis)
	// 2. Or use short-lived tokens with refresh token rotation
	// For now, this is a no-op as we use stateless JWT
	return nil
}
