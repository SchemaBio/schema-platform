package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/middleware"
	"github.com/schema-platform/backend-api/internal/model"
	"github.com/schema-platform/backend-api/internal/pkg/response"
	"github.com/schema-platform/backend-api/internal/service"
)

// UserHandler handles user endpoints
type UserHandler struct {
	userService *service.UserService
}

// NewUserHandler creates a new user handler
func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// GetUsers handles listing users
// @Summary List users
// @Description Returns a paginated list of users
// @Tags users
// @Security BearerAuth
// @Produce json
// @Param page query int false "Page number"
// @Param pageSize query int false "Page size"
// @Param sortBy query string false "Sort by field"
// @Param sortOrder query string false "Sort order (asc/desc)"
// @Success 200 {object} dto.UserListResponse
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Router /api/v1/users [get]
func (h *UserHandler) GetUsers(c *gin.Context) {
	var params dto.PaginatedRequest
	if err := c.ShouldBindQuery(&params); err != nil {
		response.ValidationError(c, map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	result, err := h.userService.GetUsers(c.Request.Context(), &params)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// CreateUser handles creating a user
// @Summary Create user
// @Description Creates a new user
// @Tags users
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body dto.UserCreateRequest true "User data"
// @Success 201 {object} dto.UserResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 409 {object} map[string]interface{}
// @Router /api/v1/users [post]
func (h *UserHandler) CreateUser(c *gin.Context) {
	var req dto.UserCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	result, err := h.userService.CreateUser(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, result)
}

// GetMe handles getting the current user
// @Summary Get current user
// @Description Returns the current authenticated user
// @Tags users
// @Security BearerAuth
// @Produce json
// @Success 200 {object} dto.UserResponse
// @Failure 401 {object} map[string]interface{}
// @Router /api/v1/users/me [get]
func (h *UserHandler) GetMe(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == "" {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	result, err := h.userService.GetUser(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// GetUser handles getting a user by ID
// @Summary Get user
// @Description Returns a user by ID
// @Tags users
// @Security BearerAuth
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} dto.UserResponse
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/v1/users/{id} [get]
func (h *UserHandler) GetUser(c *gin.Context) {
	userID := c.Param("id")

	// Check if user is accessing their own profile or is admin
	if !middleware.IsSelfOrAdmin(c, userID) {
		response.Forbidden(c, "Cannot access other user's profile")
		return
	}

	result, err := h.userService.GetUser(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// UpdateUser handles updating a user
// @Summary Update user
// @Description Updates a user by ID
// @Tags users
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param request body dto.UserUpdateRequest true "User data"
// @Success 200 {object} dto.UserResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/v1/users/{id} [put]
func (h *UserHandler) UpdateUser(c *gin.Context) {
	userID := c.Param("id")

	// Check if user is updating their own profile or is admin
	if !middleware.IsSelfOrAdmin(c, userID) {
		response.Forbidden(c, "Cannot update other user's profile")
		return
	}

	var req dto.UserUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	// Only admin can change roles
	if req.Role != nil && !middleware.IsAdmin(c) {
		response.Forbidden(c, "Only admin can change user roles")
		return
	}

	result, err := h.userService.UpdateUser(c.Request.Context(), userID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// DeleteUser handles deleting a user
// @Summary Delete user
// @Description Soft deletes a user by ID
// @Tags users
// @Security BearerAuth
// @Param id path string true "User ID"
// @Success 204
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/v1/users/{id} [delete]
func (h *UserHandler) DeleteUser(c *gin.Context) {
	userID := c.Param("id")

	if err := h.userService.DeleteUser(c.Request.Context(), userID); err != nil {
		response.Error(c, err)
		return
	}

	response.NoContent(c)
}

// RegisterRoutes registers user routes
func (h *UserHandler) RegisterRoutes(r *gin.RouterGroup) {
	// Admin only routes
	adminRoutes := r.Group("")
	adminRoutes.Use(middleware.RequireAdmin())
	{
		adminRoutes.GET("", h.GetUsers)
		adminRoutes.POST("", h.CreateUser)
		adminRoutes.DELETE("/:id", h.DeleteUser)
	}

	// Authenticated user routes
	r.GET("/me", h.GetMe)
	r.GET("/:id", h.GetUser)
	r.PUT("/:id", h.UpdateUser)
}

// RegisterAdminRoutes registers admin-only user routes
func (h *UserHandler) RegisterAdminRoutes(r *gin.RouterGroup) {
	r.Use(middleware.RequireRole(model.UserRoleAdmin))
	r.GET("", h.GetUsers)
	r.POST("", h.CreateUser)
	r.DELETE("/:id", h.DeleteUser)
}
