package service

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"github.com/schema-platform/backend-api/internal/repository"
	"github.com/schema-platform/backend-api/pkg/errors"
	"gorm.io/datatypes"
)

// AuditService handles audit log operations
type AuditService struct {
	auditRepo *repository.AuditLogRepository
}

// NewAuditService creates a new audit service
func NewAuditService(auditRepo *repository.AuditLogRepository) *AuditService {
	return &AuditService{
		auditRepo: auditRepo,
	}
}

// LogAction creates an audit log entry
func (s *AuditService) LogAction(ctx context.Context, params *AuditLogParams) error {
	changes, err := json.Marshal(params.Changes)
	if err != nil {
		changes = []byte("{}")
	}

	metadata, err := json.Marshal(params.Metadata)
	if err != nil {
		metadata = []byte("{}")
	}

	log := &model.AuditLog{
		UserID:       params.UserID,
		UserEmail:    params.UserEmail,
		Action:       params.Action,
		ResourceType: params.ResourceType,
		ResourceID:   params.ResourceID,
		Changes:      datatypes.JSON(changes),
		Metadata:     datatypes.JSON(metadata),
		IPAddress:    params.IPAddress,
		UserAgent:    params.UserAgent,
		RequestID:    params.RequestID,
	}

	return s.auditRepo.Create(ctx, log)
}

// AuditLogParams contains parameters for creating an audit log
type AuditLogParams struct {
	UserID       uuid.UUID
	UserEmail    string
	Action       model.AuditAction
	ResourceType string
	ResourceID   *uuid.UUID
	Changes      *model.AuditChanges
	Metadata     *model.AuditMetadata
	IPAddress    string
	UserAgent    string
	RequestID    string
}

// GetAuditLogs retrieves audit logs with filters
func (s *AuditService) GetAuditLogs(ctx context.Context, params *dto.AuditLogQueryParams) (*dto.AuditLogListResponse, error) {
	filter := &repository.AuditLogFilter{
		Page:     params.GetPage(),
		PageSize: params.GetPageSize(),
	}

	// Parse optional filters
	if params.UserID != nil {
		userID, err := uuid.Parse(*params.UserID)
		if err != nil {
			return nil, errors.NewValidationError("Invalid user ID")
		}
		filter.UserID = &userID
	}

	if params.Action != nil {
		action := model.AuditAction(*params.Action)
		filter.Action = &action
	}

	if params.ResourceType != nil {
		filter.ResourceType = params.ResourceType
	}

	if params.ResourceID != nil {
		resourceID, err := uuid.Parse(*params.ResourceID)
		if err != nil {
			return nil, errors.NewValidationError("Invalid resource ID")
		}
		filter.ResourceID = &resourceID
	}

	if params.StartTime != nil {
		startTime, err := time.Parse(time.RFC3339, *params.StartTime)
		if err != nil {
			return nil, errors.NewValidationError("Invalid start time format")
		}
		filter.StartTime = &startTime
	}

	if params.EndTime != nil {
		endTime, err := time.Parse(time.RFC3339, *params.EndTime)
		if err != nil {
			return nil, errors.NewValidationError("Invalid end time format")
		}
		filter.EndTime = &endTime
	}

	logs, total, err := s.auditRepo.List(ctx, filter)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.AuditLogResponse, len(logs))
	for i, log := range logs {
		items[i] = s.toAuditLogResponse(&log)
	}

	pageSize := params.GetPageSize()
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &dto.AuditLogListResponse{
		Items:      items,
		Total:      total,
		Page:       params.GetPage(),
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// CleanupOldLogs deletes audit logs older than 30 days
func (s *AuditService) CleanupOldLogs(ctx context.Context) (*dto.CleanupResponse, error) {
	// 30 days retention
	retention := 30 * 24 * time.Hour

	deleted, err := s.auditRepo.DeleteOlderThan(ctx, retention)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return &dto.CleanupResponse{
		DeletedCount: deleted,
		Message:      "Successfully cleaned up old audit logs",
	}, nil
}

// GetResourceHistory retrieves audit history for a specific resource
func (s *AuditService) GetResourceHistory(ctx context.Context, resourceType, resourceID string) ([]dto.AuditLogResponse, error) {
	id, err := uuid.Parse(resourceID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid resource ID")
	}

	logs, err := s.auditRepo.GetByResourceID(ctx, resourceType, id)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.AuditLogResponse, len(logs))
	for i, log := range logs {
		items[i] = s.toAuditLogResponse(&log)
	}

	return items, nil
}

func (s *AuditService) toAuditLogResponse(log *model.AuditLog) dto.AuditLogResponse {
	var resourceID *string
	if log.ResourceID != nil {
		id := log.ResourceID.String()
		resourceID = &id
	}

	var changes map[string]interface{}
	if log.Changes != nil {
		json.Unmarshal(log.Changes, &changes)
	}

	var metadata map[string]interface{}
	if log.Metadata != nil {
		json.Unmarshal(log.Metadata, &metadata)
	}

	return dto.AuditLogResponse{
		ID:           log.ID.String(),
		UserID:       log.UserID.String(),
		UserEmail:    log.UserEmail,
		Action:       string(log.Action),
		ResourceType: log.ResourceType,
		ResourceID:   resourceID,
		Changes:      changes,
		Metadata:     metadata,
		IPAddress:    log.IPAddress,
		UserAgent:    log.UserAgent,
		CreatedAt:    log.CreatedAt,
	}
}
