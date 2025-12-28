package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/middleware"
	"github.com/schema-platform/backend-api/internal/pkg/response"
	"github.com/schema-platform/backend-api/internal/service"
)

// AuthHandler handles authentication endpoints
type AuthHandler struct {
	authService *service.AuthService
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Login handles user login
// @Summary User login
// @Description Authenticates a user and returns JWT tokens
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.LoginRequest true "Login credentials"
// @Success 200 {object} dto.LoginResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /api/v1/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	result, err := h.authService.Login(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// RefreshToken handles token refresh
// @Summary Refresh access token
// @Description Refreshes an access token using a refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.RefreshRequest true "Refresh token"
// @Success 200 {object} dto.AuthToken
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /api/v1/auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req dto.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	result, err := h.authService.RefreshToken(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// Logout handles user logout
// @Summary User logout
// @Description Logs out the current user
// @Tags auth
// @Security BearerAuth
// @Success 204
// @Failure 401 {object} map[string]interface{}
// @Router /api/v1/auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	if err := h.authService.Logout(c.Request.Context(), userID); err != nil {
		response.Error(c, err)
		return
	}

	response.NoContent(c)
}

// RegisterRoutes registers auth routes
func (h *AuthHandler) RegisterRoutes(r *gin.RouterGroup) {
	r.POST("/login", h.Login)
	r.POST("/refresh", h.RefreshToken)
}

// RegisterProtectedRoutes registers protected auth routes
func (h *AuthHandler) RegisterProtectedRoutes(r *gin.RouterGroup) {
	r.POST("/logout", h.Logout)
}
