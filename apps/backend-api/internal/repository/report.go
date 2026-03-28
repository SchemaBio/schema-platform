package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"schema-platform/apps/backend-api/internal/model"
)

// ReportRepository handles database operations for reports
type ReportRepository struct {
	db *gorm.DB
}

// NewReportRepository creates a new report repository
func NewReportRepository(db *gorm.DB) *ReportRepository {
	return &ReportRepository{db: db}
}

// Create creates a new report
func (r *ReportRepository) Create(ctx context.Context, report *model.Report) error {
	return r.db.WithContext(ctx).Create(report).Error
}

// GetByID retrieves a report by ID
func (r *ReportRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Report, error) {
	var report model.Report
	err := r.db.WithContext(ctx).
		Preload("Task").
		Preload("Template").
		Preload("Creator").
		Preload("Reviewer").
		Preload("Approver").
		Preload("Releaser").
		First(&report, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &report, nil
}

// GetByTaskID retrieves all reports for a task
func (r *ReportRepository) GetByTaskID(ctx context.Context, taskID uuid.UUID) ([]model.Report, error) {
	var reports []model.Report
	err := r.db.WithContext(ctx).
		Preload("Creator").
		Preload("Reviewer").
		Preload("Approver").
		Preload("Releaser").
		Where("task_id = ?", taskID).
		Order("created_at DESC").
		Find(&reports).Error
	if err != nil {
		return nil, err
	}
	return reports, nil
}

// GetByOrgID retrieves all reports for an organization
func (r *ReportRepository) GetByOrgID(ctx context.Context, orgID uuid.UUID, status *model.ReportStatus) ([]model.Report, error) {
	var reports []model.Report
	query := r.db.WithContext(ctx).
		Preload("Task").
		Preload("Creator").
		Where("org_id = ?", orgID)

	if status != nil {
		query = query.Where("status = ?", *status)
	}

	err := query.Order("created_at DESC").Find(&reports).Error
	if err != nil {
		return nil, err
	}
	return reports, nil
}

// Update updates a report
func (r *ReportRepository) Update(ctx context.Context, report *model.Report) error {
	return r.db.WithContext(ctx).Save(report).Error
}

// Delete deletes a report (soft delete)
func (r *ReportRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&model.Report{}, "id = ?", id).Error
}

// UpdateStatus updates the report status
func (r *ReportRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status model.ReportStatus, userID uuid.UUID) error {
	now := time.Now()

	updates := map[string]interface{}{
		"status":     status,
		"updated_at": now,
	}

	switch status {
	case model.ReportStatusPendingReview:
		updates["reviewed_by"] = userID
		updates["reviewed_at"] = now
	case model.ReportStatusApproved:
		updates["approved_by"] = userID
		updates["approved_at"] = now
	case model.ReportStatusReleased:
		updates["released_by"] = userID
		updates["released_at"] = now
	case model.ReportStatusDraft:
		// Reset reviewers when going back to draft
		updates["reviewed_by"] = nil
		updates["reviewed_at"] = nil
	}

	return r.db.WithContext(ctx).
		Model(&model.Report{}).
		Where("id = ?", id).
		Updates(updates).Error
}

// GetTemplates retrieves all active report templates for an organization
func (r *ReportRepository) GetTemplates(ctx context.Context, orgID uuid.UUID) ([]model.ReportTemplate, error) {
	var templates []model.ReportTemplate
	err := r.db.WithContext(ctx).
		Where("org_id = ? AND is_active = ?", orgID, true).
		Order("name ASC").
		Find(&templates).Error
	if err != nil {
		return nil, err
	}
	return templates, nil
}