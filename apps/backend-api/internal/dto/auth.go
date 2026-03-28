package dto

import "time"

// LoginRequest represents the login request payload
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// LoginResponse represents the login response
type LoginResponse struct {
	AccessToken    string               `json:"accessToken"`
	RefreshToken   string               `json:"refreshToken"`
	ExpiresAt      time.Time            `json:"expiresAt"`
	User           UserResponse         `json:"user"`
	Organizations  []UserOrganizationInfo `json:"organizations"`
	CurrentOrg     *UserOrganizationInfo `json:"currentOrg,omitempty"`
}

// AuthToken represents the token pair
type AuthToken struct {
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken"`
	ExpiresAt    time.Time `json:"expiresAt"`
}

// RefreshRequest represents the token refresh request
type RefreshRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

// TokenPayload represents the JWT token payload
type TokenPayload struct {
	UserID     string `json:"userId"`
	Email      string `json:"email"`
	SystemRole string `json:"systemRole"`
	OrgID      string `json:"orgId"`
	OrgRole    string `json:"orgRole"`
}

// RegisterRequest represents the registration request payload
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Name     string `json:"name" binding:"required,min=2,max=100"`
	Password string `json:"password" binding:"required,min=8"`
}

// RegisterResponse represents the registration response
type RegisterResponse struct {
	Message string       `json:"message"`
	User    UserResponse `json:"user"`
}