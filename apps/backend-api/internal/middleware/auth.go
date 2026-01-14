package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/model"
	"github.com/schema-platform/backend-api/internal/pkg/jwt"
	"github.com/schema-platform/backend-api/internal/pkg/response"
)

const (
	// AuthorizationHeader is the header key for authorization
	AuthorizationHeader = "Authorization"
	// BearerPrefix is the prefix for bearer tokens
	BearerPrefix = "Bearer "
	// UserIDKey is the context key for user ID
	UserIDKey = "userID"
	// UserEmailKey is the context key for user email
	UserEmailKey = "userEmail"
	// UserRoleKey is the context key for user role
	UserRoleKey = "userRole"
)

// Auth creates an authentication middleware
func Auth(jwtManager *jwt.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get authorization header
		authHeader := c.GetHeader(AuthorizationHeader)
		if authHeader == "" {
			response.Unauthorized(c, "Missing authorization header")
			c.Abort()
			return
		}

		// Check bearer prefix
		if !strings.HasPrefix(authHeader, BearerPrefix) {
			response.Unauthorized(c, "Invalid authorization header format")
			c.Abort()
			return
		}

		// Extract token
		token := strings.TrimPrefix(authHeader, BearerPrefix)
		if token == "" {
			response.Unauthorized(c, "Missing token")
			c.Abort()
			return
		}

		// Validate token
		claims, err := jwtManager.ValidateAccessToken(token)
		if err != nil {
			if err == jwt.ErrExpiredToken {
				response.Unauthorized(c, "Token has expired")
			} else {
				response.Unauthorized(c, "Invalid token")
			}
			c.Abort()
			return
		}

		// Set user info in context
		c.Set(UserIDKey, claims.UserID)
		c.Set(UserEmailKey, claims.Email)
		c.Set(UserRoleKey, claims.Role)

		c.Next()
	}
}

// RequireRole creates a middleware that requires specific roles
func RequireRole(roles ...model.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get(UserRoleKey)
		if !exists {
			response.Unauthorized(c, "User role not found")
			c.Abort()
			return
		}

		role := model.UserRole(userRole.(string))
		for _, r := range roles {
			if role == r {
				c.Next()
				return
			}
		}

		response.Forbidden(c, "Insufficient permissions")
		c.Abort()
	}
}

// RequireAdmin creates a middleware that requires admin role
func RequireAdmin() gin.HandlerFunc {
	return RequireRole(model.UserRoleAdmin)
}

// RequireDoctor creates a middleware that requires doctor or admin role
func RequireDoctor() gin.HandlerFunc {
	return RequireRole(model.UserRoleAdmin, model.UserRoleDoctor)
}

// RequireAnalyst creates a middleware that requires analyst, doctor, or admin role
func RequireAnalyst() gin.HandlerFunc {
	return RequireRole(model.UserRoleAdmin, model.UserRoleDoctor, model.UserRoleAnalyst)
}

// GetUserID gets the user ID from context
func GetUserID(c *gin.Context) string {
	userID, exists := c.Get(UserIDKey)
	if !exists {
		return ""
	}
	return userID.(string)
}

// GetUserEmail gets the user email from context
func GetUserEmail(c *gin.Context) string {
	email, exists := c.Get(UserEmailKey)
	if !exists {
		return ""
	}
	return email.(string)
}

// GetUserRole gets the user role from context
func GetUserRole(c *gin.Context) model.UserRole {
	role, exists := c.Get(UserRoleKey)
	if !exists {
		return ""
	}
	return model.UserRole(role.(string))
}

// IsAdmin checks if the current user is an admin
func IsAdmin(c *gin.Context) bool {
	return GetUserRole(c) == model.UserRoleAdmin
}

// IsSelfOrAdmin checks if the current user is the target user or an admin
func IsSelfOrAdmin(c *gin.Context, targetUserID string) bool {
	return GetUserID(c) == targetUserID || IsAdmin(c)
}

// RequirePermission creates a middleware that requires specific permissions
func RequirePermission(permissionCodes ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := GetUserRole(c)
		if userRole == "" {
			response.Unauthorized(c, "User role not found")
			c.Abort()
			return
		}

		// Admin has all permissions
		if userRole == model.UserRoleAdmin {
			c.Next()
			return
		}

		// Check if user has any of the required permissions
		for _, code := range permissionCodes {
			if userRole.HasPermission(code) {
				c.Next()
				return
			}
		}

		response.Forbidden(c, "Insufficient permissions")
		c.Abort()
	}
}

// RequireAnyPermission requires at least one of the specified permissions
func RequireAnyPermission(permissions ...string) gin.HandlerFunc {
	return RequirePermission(permissions...)
}

// RequireAllPermissions requires all of the specified permissions
func RequireAllPermissions(permissionCodes ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := GetUserRole(c)
		if userRole == "" {
			response.Unauthorized(c, "User role not found")
			c.Abort()
			return
		}

		// Admin has all permissions
		if userRole == model.UserRoleAdmin {
			c.Next()
			return
		}

		// Check if user has all required permissions
		hasAll := true
		for _, code := range permissionCodes {
			if !userRole.HasPermission(code) {
				hasAll = false
				break
			}
		}

		if hasAll {
			c.Next()
			return
		}

		response.Forbidden(c, "Insufficient permissions")
		c.Abort()
	}
}
