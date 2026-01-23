package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/pkg/response"
	"github.com/schema-platform/backend-api/internal/service"
)

// AuditHandler handles audit log endpoints
type AuditHandler struct {
	auditService *service.AuditService
}

// NewAuditHandler creates a new audit handler
func NewAuditHandler(auditService *service.AuditService) *AuditHandler {
	return &AuditHandler{auditService: auditService}
}

// GetAuditLogs handles listing audit logs
func (h *AuditHandler) GetAuditLogs(c *gin.Context) {
	var params dto.AuditLogQueryParams
	if err := c.ShouldBindQuery(&params); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.auditService.GetAuditLogs(c.Request.Context(), &params)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// GetResourceHistory handles getting audit history for a resource
func (h *AuditHandler) GetResourceHistory(c *gin.Context) {
	resourceType := c.Param("type")
	resourceID := c.Param("id")

	result, err := h.auditService.GetResourceHistory(c.Request.Context(), resourceType, resourceID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// Cleanup handles cleaning up old audit logs
func (h *AuditHandler) Cleanup(c *gin.Context) {
	result, err := h.auditService.CleanupOldLogs(c.Request.Context())
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// RegisterRoutes registers audit routes
func (h *AuditHandler) RegisterRoutes(r *gin.RouterGroup) {
	r.GET("", h.GetAuditLogs)
	r.GET("/resource/:type/:id", h.GetResourceHistory)
	r.POST("/cleanup", h.Cleanup)
}
