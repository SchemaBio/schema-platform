package middleware

import (
	"bytes"
	"io"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/model"
	"github.com/schema-platform/backend-api/internal/service"
)

// AuditMiddleware creates audit logging middleware
type AuditMiddleware struct {
	auditService *service.AuditService
}

// NewAuditMiddleware creates a new audit middleware
func NewAuditMiddleware(auditService *service.AuditService) *AuditMiddleware {
	return &AuditMiddleware{auditService: auditService}
}

// Audit creates middleware for auditing write operations
func (m *AuditMiddleware) Audit(resourceType string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Only audit write operations
		method := c.Request.Method
		if method != "POST" && method != "PUT" && method != "DELETE" {
			c.Next()
			return
		}

		// Get request body for POST/PUT
		var requestBody []byte
		if method == "POST" || method == "PUT" {
			requestBody, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
		}

		c.Next()

		// Only log if request was successful (2xx status)
		status := c.Writer.Status()
		if status < 200 || status >= 300 {
			return
		}

		m.logAudit(c, resourceType, method, requestBody)
	}
}

func (m *AuditMiddleware) logAudit(c *gin.Context, resourceType, method string, requestBody []byte) {
	// Get user info
	userID, _ := uuid.Parse(GetUserID(c))
	userEmail := GetUserEmail(c)

	// Determine action
	var action model.AuditAction
	switch method {
	case "POST":
		action = model.AuditActionCreate
	case "PUT":
		action = model.AuditActionUpdate
	case "DELETE":
		action = model.AuditActionDelete
	}

	// Get resource ID from URL param
	var resourceID *uuid.UUID
	if id := c.Param("id"); id != "" {
		if parsed, err := uuid.Parse(id); err == nil {
			resourceID = &parsed
		}
	}

	// Build changes
	var changes *model.AuditChanges
	if len(requestBody) > 0 {
		changes = &model.AuditChanges{
			After: map[string]interface{}{
				"requestBody": string(requestBody),
			},
		}
	}

	// Log the action
	params := &service.AuditLogParams{
		UserID:       userID,
		UserEmail:    userEmail,
		Action:       action,
		ResourceType: resourceType,
		ResourceID:   resourceID,
		Changes:      changes,
		IPAddress:    c.ClientIP(),
		UserAgent:    c.Request.UserAgent(),
		RequestID:    c.GetHeader("X-Request-ID"),
	}

	// Log asynchronously to not block response
	go m.auditService.LogAction(c.Request.Context(), params)
}
