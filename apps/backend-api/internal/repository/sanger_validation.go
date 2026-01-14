package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// SangerValidationRepository handles database operations for Sanger validations
type SangerValidationRepository struct {
	db *gorm.DB
}

// NewSangerValidationRepository creates a new SangerValidationRepository
func NewSangerValidationRepository(db *gorm.DB) *SangerValidationRepository {
	return &SangerValidationRepository{db: db}
}

// Create creates a new Sanger validation
func (r *SangerValidationRepository) Create(ctx context.Context, sanger *model.SangerValidation) error {
	return r.db.WithContext(ctx).Create(sanger).Error
}

// GetByID retrieves a Sanger validation by ID
func (r *SangerValidationRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.SangerValidation, error) {
	var sanger model.SangerValidation
	err := r.db.WithContext(ctx).
		Preload("Task").
		First(&sanger, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &sanger, nil
}

// GetByTaskID retrieves all Sanger validations for a task
func (r *SangerValidationRepository) GetByTaskID(ctx context.Context, taskID uuid.UUID) ([]model.SangerValidation, error) {
	var sangers []model.SangerValidation
	err := r.db.WithContext(ctx).
		Order("requested_at DESC").
		Find(&sangers, "task_id = ?", taskID).Error
	return sangers, err
}

// GetByVariantID retrieves Sanger validations for a variant
func (r *SangerValidationRepository) GetByVariantID(ctx context.Context, variantID string) ([]model.SangerValidation, error) {
	var sangers []model.SangerValidation
	err := r.db.WithContext(ctx).
		Order("requested_at DESC").
		Find(&sangers, "variant_id = ?", variantID).Error
	return sangers, err
}

// List retrieves all Sanger validations
func (r *SangerValidationRepository) List(ctx context.Context, limit, offset int) ([]model.SangerValidation, int64, error) {
	var sangers []model.SangerValidation
	var total int64

	r.db.WithContext(ctx).Model(&model.SangerValidation{}).Count(&total)

	err := r.db.WithContext(ctx).
		Preload("Task").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&sangers).Error

	return sangers, total, err
}

// ListByStatus retrieves Sanger validations by status
func (r *SangerValidationRepository) ListByStatus(ctx context.Context, status model.SangerStatus, limit, offset int) ([]model.SangerValidation, int64, error) {
	var sangers []model.SangerValidation
	var total int64

	query := r.db.WithContext(ctx).Model(&model.SangerValidation{}).Where("status = ?", status)
	query.Count(&total)

	err := query.Order("requested_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&sangers).Error

	return sangers, total, err
}

// Update updates a Sanger validation
func (r *SangerValidationRepository) Update(ctx context.Context, sanger *model.SangerValidation) error {
	return r.db.WithContext(ctx).Save(sanger).Error
}

// Delete soft deletes a Sanger validation
func (r *SangerValidationRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&model.SangerValidation{}, "id = ?", id).Error
}

// Complete marks a Sanger validation as completed
func (r *SangerValidationRepository) Complete(ctx context.Context, id uuid.UUID, result model.SangerResult, completedBy uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&model.SangerValidation{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":       model.SangerStatusCompleted,
			"result":       result,
			"completed_by": completedBy,
			"completed_at": time.Now(),
		}).Error
}

// CountByStatus counts Sanger validations by status
func (r *SangerValidationRepository) CountByStatus(ctx context.Context) (map[model.SangerStatus]int64, error) {
	result := make(map[model.SangerStatus]int64)

	type Result struct {
		Status string
		Count  int64
	}

	var counts []Result
	err := r.db.WithContext(ctx).
		Model(&model.SangerValidation{}).
		Select("status, count(*) as count").
		Group("status").
		Scan(&counts).Error

	if err != nil {
		return nil, err
	}

	for _, c := range counts {
		result[model.SangerStatus(c.Status)] = c.Count
	}

	return result, nil
}
