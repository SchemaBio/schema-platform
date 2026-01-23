package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// AuditLogRepository handles audit log database operations
type AuditLogRepository struct {
	db *gorm.DB
}

// NewAuditLogRepository creates a new audit log repository
func NewAuditLogRepository(db *gorm.DB) *AuditLogRepository {
	return &AuditLogRepository{db: db}
}

// Create creates a new audit log entry
func (r *AuditLogRepository) Create(ctx context.Context, log *model.AuditLog) error {
	return r.db.WithContext(ctx).Create(log).Error
}

// AuditLogFilter defines filter options for querying audit logs
type AuditLogFilter struct {
	UserID       *uuid.UUID
	Action       *model.AuditAction
	ResourceType *string
	ResourceID   *uuid.UUID
	StartTime    *time.Time
	EndTime      *time.Time
	Page         int
	PageSize     int
}

// List retrieves audit logs with filters and pagination
func (r *AuditLogRepository) List(ctx context.Context, filter *AuditLogFilter) ([]model.AuditLog, int64, error) {
	var logs []model.AuditLog
	var total int64

	query := r.db.WithContext(ctx).Model(&model.AuditLog{})

	// Apply filters
	if filter.UserID != nil {
		query = query.Where("user_id = ?", *filter.UserID)
	}
	if filter.Action != nil {
		query = query.Where("action = ?", *filter.Action)
	}
	if filter.ResourceType != nil {
		query = query.Where("resource_type = ?", *filter.ResourceType)
	}
	if filter.ResourceID != nil {
		query = query.Where("resource_id = ?", *filter.ResourceID)
	}
	if filter.StartTime != nil {
		query = query.Where("created_at >= ?", *filter.StartTime)
	}
	if filter.EndTime != nil {
		query = query.Where("created_at <= ?", *filter.EndTime)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	page := filter.Page
	if page < 1 {
		page = 1
	}
	pageSize := filter.PageSize
	if pageSize < 1 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	// Order by created_at desc and fetch
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}

// DeleteOlderThan deletes audit logs older than the specified duration
func (r *AuditLogRepository) DeleteOlderThan(ctx context.Context, duration time.Duration) (int64, error) {
	cutoff := time.Now().Add(-duration)
	result := r.db.WithContext(ctx).Where("created_at < ?", cutoff).Delete(&model.AuditLog{})
	return result.RowsAffected, result.Error
}

// GetByResourceID retrieves all audit logs for a specific resource
func (r *AuditLogRepository) GetByResourceID(ctx context.Context, resourceType string, resourceID uuid.UUID) ([]model.AuditLog, error) {
	var logs []model.AuditLog
	err := r.db.WithContext(ctx).
		Where("resource_type = ? AND resource_id = ?", resourceType, resourceID).
		Order("created_at DESC").
		Find(&logs).Error
	return logs, err
}
