package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
	// SystemRoleKey is the context key for system role
	SystemRoleKey = "systemRole"
	// OrgIDKey is the context key for organization ID
	OrgIDKey = "orgID"
	// OrgRoleKey is the context key for organization role
	OrgRoleKey = "orgRole"
	// OrgsKey is the context key for user's organizations
	OrgsKey = "orgs"
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
		c.Set(SystemRoleKey, claims.SystemRole)
		c.Set(OrgIDKey, claims.OrgID)
		c.Set(OrgRoleKey, claims.OrgRole)
		c.Set(OrgsKey, claims.Orgs)

		c.Next()
	}
}

// RequireOrgRole creates a middleware that requires specific org roles
func RequireOrgRole(roles ...model.OrgRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if user is super admin (bypasses org role check)
		if IsSuperAdmin(c) {
			c.Next()
			return
		}

		orgRole := GetOrgRole(c)
		if orgRole == "" {
			response.Unauthorized(c, "User organization role not found")
			c.Abort()
			return
		}

		role := model.OrgRole(orgRole)
		for _, r := range roles {
			if role == r {
				c.Next()
				return
			}
		}

		response.Forbidden(c, "Insufficient organization permissions")
		c.Abort()
	}
}

// RequireSuperAdmin creates a middleware that requires super admin system role
func RequireSuperAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !IsSuperAdmin(c) {
			response.Forbidden(c, "Super admin access required")
			c.Abort()
			return
		}
		c.Next()
	}
}

// RequireOwnerOrAdmin creates a middleware that requires OWNER or ADMIN org role
func RequireOwnerOrAdmin() gin.HandlerFunc {
	return RequireOrgRole(model.OrgRoleOwner, model.OrgRoleAdmin)
}

// RequireDoctor creates a middleware that requires doctor or higher org role
func RequireDoctor() gin.HandlerFunc {
	return RequireOrgRole(model.OrgRoleOwner, model.OrgRoleAdmin, model.OrgRoleDoctor)
}

// RequireAnalyst creates a middleware that requires analyst or higher org role
func RequireAnalyst() gin.HandlerFunc {
	return RequireOrgRole(model.OrgRoleOwner, model.OrgRoleAdmin, model.OrgRoleDoctor, model.OrgRoleAnalyst)
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

// GetSystemRole gets the system role from context
func GetSystemRole(c *gin.Context) model.SystemRole {
	role, exists := c.Get(SystemRoleKey)
	if !exists {
		return ""
	}
	return model.SystemRole(role.(string))
}

// GetOrgID gets the organization ID from context as UUID
func GetOrgID(c *gin.Context) uuid.UUID {
	orgIDStr, exists := c.Get(OrgIDKey)
	if !exists || orgIDStr == "" {
		return uuid.Nil
	}
	orgID, err := uuid.Parse(orgIDStr.(string))
	if err != nil {
		return uuid.Nil
	}
	return orgID
}

// GetOrgIDString gets the organization ID from context as string
func GetOrgIDString(c *gin.Context) string {
	orgID, exists := c.Get(OrgIDKey)
	if !exists {
		return ""
	}
	return orgID.(string)
}

// GetOrgRole gets the organization role from context
func GetOrgRole(c *gin.Context) model.OrgRole {
	role, exists := c.Get(OrgRoleKey)
	if !exists {
		return ""
	}
	return model.OrgRole(role.(string))
}

// GetOrgs gets the user's organization memberships from context
func GetOrgs(c *gin.Context) []jwt.OrgClaim {
	orgs, exists := c.Get(OrgsKey)
	if !exists {
		return nil
	}
	return orgs.([]jwt.OrgClaim)
}

// IsSuperAdmin checks if the current user is a system super admin
func IsSuperAdmin(c *gin.Context) bool {
	return GetSystemRole(c) == model.SystemRoleSuperAdmin
}

// IsOrgOwner checks if the current user is an org owner
func IsOrgOwner(c *gin.Context) bool {
	return GetOrgRole(c) == model.OrgRoleOwner
}

// IsOrgAdmin checks if the current user is an org admin or higher
func IsOrgAdmin(c *gin.Context) bool {
	role := GetOrgRole(c)
	return role == model.OrgRoleOwner || role == model.OrgRoleAdmin
}

// IsSelfOrOrgAdmin checks if the current user is the target user or an org admin
func IsSelfOrOrgAdmin(c *gin.Context, targetUserID string) bool {
	return GetUserID(c) == targetUserID || IsOrgAdmin(c) || IsSuperAdmin(c)
}

// RequirePermission creates a middleware that requires specific permissions based on org role
func RequirePermission(permissionCodes ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Super admin has all permissions
		if IsSuperAdmin(c) {
			c.Next()
			return
		}

		orgRole := GetOrgRole(c)
		if orgRole == "" {
			response.Unauthorized(c, "User organization role not found")
			c.Abort()
			return
		}

		// Owner and Admin have all permissions
		if orgRole == model.OrgRoleOwner || orgRole == model.OrgRoleAdmin {
			c.Next()
			return
		}

		// Check if user has any of the required permissions
		for _, code := range permissionCodes {
			if orgRole.HasPermission(code) {
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
		// Super admin has all permissions
		if IsSuperAdmin(c) {
			c.Next()
			return
		}

		orgRole := GetOrgRole(c)
		if orgRole == "" {
			response.Unauthorized(c, "User organization role not found")
			c.Abort()
			return
		}

		// Owner and Admin have all permissions
		if orgRole == model.OrgRoleOwner || orgRole == model.OrgRoleAdmin {
			c.Next()
			return
		}

		// Check if user has all required permissions
		hasAll := true
		for _, code := range permissionCodes {
			if !orgRole.HasPermission(code) {
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
