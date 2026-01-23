package dto

import (
	"time"
)

// AuditLogResponse represents an audit log entry response
type AuditLogResponse struct {
	ID           string                 `json:"id"`
	UserID       string                 `json:"userId"`
	UserEmail    string                 `json:"userEmail"`
	Action       string                 `json:"action"`
	ResourceType string                 `json:"resourceType"`
	ResourceID   *string                `json:"resourceId"`
	Changes      map[string]interface{} `json:"changes,omitempty"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`
	IPAddress    string                 `json:"ipAddress"`
	UserAgent    string                 `json:"userAgent"`
	CreatedAt    time.Time              `json:"createdAt"`
}

// AuditLogListResponse represents a paginated list of audit logs
type AuditLogListResponse struct {
	Items      []AuditLogResponse `json:"items"`
	Total      int64              `json:"total"`
	Page       int                `json:"page"`
	PageSize   int                `json:"pageSize"`
	TotalPages int                `json:"totalPages"`
}

// AuditLogQueryParams represents query parameters for audit logs
type AuditLogQueryParams struct {
	PaginatedRequest
	UserID       *string `form:"userId"`
	Action       *string `form:"action"`
	ResourceType *string `form:"resourceType"`
	ResourceID   *string `form:"resourceId"`
	StartTime    *string `form:"startTime"`
	EndTime      *string `form:"endTime"`
}

// CleanupResponse represents the response for cleanup operation
type CleanupResponse struct {
	DeletedCount int64  `json:"deletedCount"`
	Message      string `json:"message"`
}
