package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"github.com/schema-platform/backend-api/internal/pkg/hash"
	"github.com/schema-platform/backend-api/internal/pkg/jwt"
	"github.com/schema-platform/backend-api/internal/repository"
	"github.com/schema-platform/backend-api/pkg/errors"
)

// AuthService handles authentication operations
type AuthService struct {
	userRepo  *repository.UserRepository
	jwtManager *jwt.Manager
	orgRepo   *repository.OrganizationRepository
}

// NewAuthService creates a new auth service
func NewAuthService(userRepo *repository.UserRepository, jwtManager *jwt.Manager, orgRepo *repository.OrganizationRepository) *AuthService {
	return &AuthService{
		userRepo:   userRepo,
		jwtManager: jwtManager,
		orgRepo:    orgRepo,
	}
}

// Login authenticates a user and returns tokens with organization context
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

	// Get user's organizations
	orgMemberships, err := s.orgRepo.GetUserOrgMemberships(ctx, user.ID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	// Build organization info for JWT and response
	orgInfos := make([]jwt.OrgInfo, len(orgMemberships))
	userOrgInfos := make([]dto.UserOrganizationInfo, len(orgMemberships))

	var currentOrgID uuid.UUID
	var currentOrgRole model.OrgRole

	for i, membership := range orgMemberships {
		orgInfos[i] = jwt.OrgInfo{
			OrgID:   membership.OrgID,
			OrgName: membership.Org.Name,
			OrgRole: string(membership.OrgRole),
		}

		userOrgInfos[i] = dto.UserOrganizationInfo{
			ID:          membership.OrgID.String(),
			Name:        membership.Org.Name,
			Slug:        membership.Org.Slug,
			Description: membership.Org.Description,
			OrgRole:     string(membership.OrgRole),
			JoinedAt:    membership.JoinedAt,
		}

		// Use primary org if set, otherwise use first org
		if user.PrimaryOrgID != nil && *user.PrimaryOrgID == membership.OrgID {
			currentOrgID = membership.OrgID
			currentOrgRole = membership.OrgRole
		} else if currentOrgID == uuid.Nil {
			currentOrgID = membership.OrgID
			currentOrgRole = membership.OrgRole
		}
	}

	// Generate tokens with organization context
	accessToken, expiresAt, err := s.jwtManager.GenerateAccessToken(
		user.ID.String(),
		user.Email,
		string(user.SystemRole),
		currentOrgID.String(),
		string(currentOrgRole),
		orgInfos,
	)
	if err != nil {
		return nil, errors.NewInternalError("Failed to generate access token")
	}

	refreshToken, _, err := s.jwtManager.GenerateRefreshToken(user.ID.String(), user.Email, string(user.SystemRole))
	if err != nil {
		return nil, errors.NewInternalError("Failed to generate refresh token")
	}

	// Build current org info
	var currentOrgInfo *dto.UserOrganizationInfo
	for _, info := range userOrgInfos {
		if info.ID == currentOrgID.String() {
			currentOrgInfo = &info
			break
		}
	}

	return &dto.LoginResponse{
		AccessToken:   accessToken,
		RefreshToken:  refreshToken,
		ExpiresAt:     expiresAt,
		Organizations: userOrgInfos,
		CurrentOrg:    currentOrgInfo,
		User: dto.UserResponse{
			ID:          user.ID.String(),
			Email:       user.Email,
			Name:        user.Name,
			SystemRole:  string(user.SystemRole),
			PrimaryOrgID: func() string { if user.PrimaryOrgID != nil { return user.PrimaryOrgID.String() }; return "" }(),
			IsActive:    user.IsActive,
			CreatedAt:   user.CreatedAt,
			UpdatedAt:   user.UpdatedAt,
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

	// Get user's organizations to rebuild access token
	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		return nil, errors.NewUnauthorizedError("Invalid user ID in token")
	}

	// Get user's organizations
	orgMemberships, err := s.orgRepo.GetUserOrgMemberships(ctx, userID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	// Build organization info
	orgInfos := make([]jwt.OrgInfo, len(orgMemberships))
	var currentOrgID uuid.UUID
	var currentOrgRole model.OrgRole

	for i, membership := range orgMemberships {
		orgInfos[i] = jwt.OrgInfo{
			OrgID:   membership.OrgID,
			OrgName: membership.Org.Name,
			OrgRole: string(membership.OrgRole),
		}

		// Use the org from the refresh token or primary org
		if currentOrgID == uuid.Nil {
			currentOrgID = membership.OrgID
			currentOrgRole = membership.OrgRole
		}
	}

	// Generate new access token
	accessToken, expiresAt, err := s.jwtManager.GenerateAccessToken(
		claims.UserID,
		claims.Email,
		claims.SystemRole,
		currentOrgID.String(),
		string(currentOrgRole),
		orgInfos,
	)
	if err != nil {
		return nil, errors.NewInternalError("Failed to generate access token")
	}

	// Generate new refresh token
	refreshToken, _, err := s.jwtManager.GenerateRefreshToken(claims.UserID, claims.Email, claims.SystemRole)
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
		UserID:     claims.UserID,
		Email:      claims.Email,
		SystemRole: claims.SystemRole,
		OrgID:      claims.OrgID,
		OrgRole:    claims.OrgRole,
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