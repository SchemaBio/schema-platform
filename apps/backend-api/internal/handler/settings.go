package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/middleware"
	"github.com/schema-platform/backend-api/internal/pkg/response"
	"github.com/schema-platform/backend-api/internal/service"
)

// SettingsHandler handles settings endpoints
type SettingsHandler struct {
	settingsService *service.SettingsService
}

// NewSettingsHandler creates a new settings handler
func NewSettingsHandler(settingsService *service.SettingsService) *SettingsHandler {
	return &SettingsHandler{settingsService: settingsService}
}

// GetUserSettings handles getting user settings
func (h *SettingsHandler) GetUserSettings(c *gin.Context) {
	userID := middleware.GetUserID(c)

	result, err := h.settingsService.GetUserSettings(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// UpdateUserSettings handles updating user settings
func (h *SettingsHandler) UpdateUserSettings(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req dto.UserSettingsUpdate
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.settingsService.UpdateUserSettings(c.Request.Context(), userID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// GetSystemConfig handles getting system configuration
func (h *SettingsHandler) GetSystemConfig(c *gin.Context) {
	key := c.Param("key")

	result, err := h.settingsService.GetSystemConfig(c.Request.Context(), key)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// UpdateSystemConfig handles updating system configuration
func (h *SettingsHandler) UpdateSystemConfig(c *gin.Context) {
	key := c.Param("key")

	var req dto.SystemConfigUpdate
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.settingsService.UpdateSystemConfig(c.Request.Context(), key, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// RegisterRoutes registers settings routes
func (h *SettingsHandler) RegisterRoutes(r *gin.RouterGroup) {
	// User settings
	r.GET("/user", h.GetUserSettings)
	r.PUT("/user", h.UpdateUserSettings)

	// System config (admin only)
	admin := r.Group("/system")
	admin.Use(middleware.RequireAdmin())
	{
		admin.GET("/:key", h.GetSystemConfig)
		admin.PUT("/:key", h.UpdateSystemConfig)
	}
}
