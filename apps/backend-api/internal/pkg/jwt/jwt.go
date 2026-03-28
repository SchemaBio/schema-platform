package jwt

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var (
	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken = errors.New("token has expired")
)

// TokenType represents the type of JWT token
type TokenType string

const (
	AccessToken  TokenType = "access"
	RefreshToken TokenType = "refresh"
)

// OrgClaim represents an organization membership claim
type OrgClaim struct {
	OrgID   string `json:"orgId"`
	OrgName string `json:"orgName"`
	OrgRole string `json:"orgRole"`
}

// Claims represents the JWT claims
type Claims struct {
	UserID     string     `json:"userId"`
	Email      string     `json:"email"`
	SystemRole string     `json:"systemRole"`         // System-level role (SUPER_ADMIN/USER)
	OrgID      string     `json:"orgId"`              // Current organization ID
	OrgRole    string     `json:"orgRole"`            // Current organization role
	Orgs       []OrgClaim `json:"orgs,omitempty"`     // User's organization memberships
	TokenType  TokenType  `json:"tokenType"`
	jwt.RegisteredClaims
}

// Manager handles JWT token operations
type Manager struct {
	secret           []byte
	accessExpiresIn  time.Duration
	refreshExpiresIn time.Duration
	issuer           string
}

// NewManager creates a new JWT manager
func NewManager(secret string, accessExpiresIn, refreshExpiresIn time.Duration, issuer string) *Manager {
	return &Manager{
		secret:           []byte(secret),
		accessExpiresIn:  accessExpiresIn,
		refreshExpiresIn: refreshExpiresIn,
		issuer:           issuer,
	}
}

// OrgInfo contains organization info for token generation
type OrgInfo struct {
	OrgID   uuid.UUID
	OrgName string
	OrgRole string
}

// GenerateAccessToken generates a new access token with organization context
func (m *Manager) GenerateAccessToken(userID, email, systemRole string, currentOrgID, currentOrgRole string, orgs []OrgInfo) (string, time.Time, error) {
	expiresAt := time.Now().Add(m.accessExpiresIn)

	// Convert OrgInfo to OrgClaim
	orgClaims := make([]OrgClaim, len(orgs))
	for i, org := range orgs {
		orgClaims[i] = OrgClaim{
			OrgID:   org.OrgID.String(),
			OrgName: org.OrgName,
			OrgRole: org.OrgRole,
		}
	}

	claims := &Claims{
		UserID:     userID,
		Email:      email,
		SystemRole: systemRole,
		OrgID:      currentOrgID,
		OrgRole:    currentOrgRole,
		Orgs:       orgClaims,
		TokenType:  AccessToken,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    m.issuer,
			ID:        uuid.New().String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(m.secret)
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expiresAt, nil
}

// GenerateRefreshToken generates a new refresh token
func (m *Manager) GenerateRefreshToken(userID, email, systemRole string) (string, time.Time, error) {
	expiresAt := time.Now().Add(m.refreshExpiresIn)
	return m.generateRefreshToken(userID, email, systemRole, expiresAt)
}

// generateRefreshToken generates a refresh token (without org context since it's long-lived)
func (m *Manager) generateRefreshToken(userID, email, systemRole string, expiresAt time.Time) (string, time.Time, error) {
	claims := &Claims{
		UserID:     userID,
		Email:      email,
		SystemRole: systemRole,
		TokenType:  RefreshToken,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    m.issuer,
			ID:        uuid.New().String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(m.secret)
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expiresAt, nil
}

// ValidateToken validates a JWT token and returns the claims
func (m *Manager) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return m.secret, nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// ValidateAccessToken validates an access token
func (m *Manager) ValidateAccessToken(tokenString string) (*Claims, error) {
	claims, err := m.ValidateToken(tokenString)
	if err != nil {
		return nil, err
	}

	if claims.TokenType != AccessToken {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// ValidateRefreshToken validates a refresh token
func (m *Manager) ValidateRefreshToken(tokenString string) (*Claims, error) {
	claims, err := m.ValidateToken(tokenString)
	if err != nil {
		return nil, err
	}

	if claims.TokenType != RefreshToken {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// RefreshAccessToken generates a new access token from a valid refresh token
// Note: This requires the auth service to fetch org info separately
func (m *Manager) RefreshAccessToken(refreshToken string) (*Claims, error) {
	claims, err := m.ValidateRefreshToken(refreshToken)
	if err != nil {
		return nil, err
	}
	return claims, nil
}

// IsSuperAdmin checks if the user has super admin system role
func (c *Claims) IsSuperAdmin() bool {
	return c.SystemRole == "SUPER_ADMIN"
}

// HasOrgRole checks if the user has a specific org role
func (c *Claims) HasOrgRole(role string) bool {
	return c.OrgRole == role
}

// GetOrgIDs returns all organization IDs the user belongs to
func (c *Claims) GetOrgIDs() []string {
	orgIDs := make([]string, len(c.Orgs))
	for i, org := range c.Orgs {
		orgIDs[i] = org.OrgID
	}
	return orgIDs
}
