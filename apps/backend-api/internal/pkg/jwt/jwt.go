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

// Claims represents the JWT claims
type Claims struct {
	UserID    string    `json:"userId"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	TokenType TokenType `json:"tokenType"`
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

// GenerateAccessToken generates a new access token
func (m *Manager) GenerateAccessToken(userID, email, role string) (string, time.Time, error) {
	expiresAt := time.Now().Add(m.accessExpiresIn)
	return m.generateToken(userID, email, role, AccessToken, expiresAt)
}

// GenerateRefreshToken generates a new refresh token
func (m *Manager) GenerateRefreshToken(userID, email, role string) (string, time.Time, error) {
	expiresAt := time.Now().Add(m.refreshExpiresIn)
	return m.generateToken(userID, email, role, RefreshToken, expiresAt)
}

// generateToken generates a JWT token
func (m *Manager) generateToken(userID, email, role string, tokenType TokenType, expiresAt time.Time) (string, time.Time, error) {
	claims := &Claims{
		UserID:    userID,
		Email:     email,
		Role:      role,
		TokenType: tokenType,
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
func (m *Manager) RefreshAccessToken(refreshToken string) (string, time.Time, error) {
	claims, err := m.ValidateRefreshToken(refreshToken)
	if err != nil {
		return "", time.Time{}, err
	}

	return m.GenerateAccessToken(claims.UserID, claims.Email, claims.Role)
}
