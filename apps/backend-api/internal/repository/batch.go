package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// BatchRepository handles batch data access
type BatchRepository struct {
	*BaseRepository[model.Batch]
}

// NewBatchRepository creates a new batch repository
func NewBatchRepository(db *gorm.DB) *BatchRepository {
	return &BatchRepository{
		BaseRepository: NewBaseRepository[model.Batch](db),
	}
}

// GetAll retrieves all batches with pagination and filtering
func (r *BatchRepository) GetAll(ctx context.Context, params *dto.BatchQueryParams) ([]model.Batch, int64, error) {
	var batches []model.Batch
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.Batch{})

	// Apply filters
	if params.Status != nil && *params.Status != "" {
		query = query.Where("status = ?", *params.Status)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply sorting
	if params.SortBy != "" {
		order := params.SortBy + " " + params.GetSortOrder()
		query = query.Order(order)
	} else {
		query = query.Order("created_at desc")
	}

	// Apply pagination
	offset := params.GetOffset()
	limit := params.GetPageSize()
	if err := query.Offset(offset).Limit(limit).Find(&batches).Error; err != nil {
		return nil, 0, err
	}

	return batches, total, nil
}

// GetWithSamples retrieves a batch with its samples
func (r *BatchRepository) GetWithSamples(ctx context.Context, batchID uuid.UUID) (*model.Batch, error) {
	var batch model.Batch
	err := r.DB().WithContext(ctx).Preload("Samples").Where("id = ?", batchID).First(&batch).Error
	if err != nil {
		return nil, err
	}
	return &batch, nil
}

// AddSamples adds samples to a batch
func (r *BatchRepository) AddSamples(ctx context.Context, batchID uuid.UUID, sampleIDs []uuid.UUID) error {
	return r.DB().WithContext(ctx).Model(&model.Sample{}).Where("id IN ?", sampleIDs).Update("batch_id", batchID).Error
}

// RemoveSamples removes samples from a batch
func (r *BatchRepository) RemoveSamples(ctx context.Context, batchID uuid.UUID, sampleIDs []uuid.UUID) error {
	return r.DB().WithContext(ctx).Model(&model.Sample{}).Where("id IN ? AND batch_id = ?", sampleIDs, batchID).Update("batch_id", nil).Error
}

// UpdateStatus updates a batch's status
func (r *BatchRepository) UpdateStatus(ctx context.Context, batchID uuid.UUID, status model.SampleStatus) error {
	updates := map[string]interface{}{
		"status": status,
	}
	if status == model.SampleStatusCompleted {
		updates["completed_at"] = time.Now()
	}
	return r.DB().WithContext(ctx).Model(&model.Batch{}).Where("id = ?", batchID).Updates(updates).Error
}

// GetSampleCount returns the number of samples in a batch
func (r *BatchRepository) GetSampleCount(ctx context.Context, batchID uuid.UUID) (int64, error) {
	var count int64
	err := r.DB().WithContext(ctx).Model(&model.Sample{}).Where("batch_id = ?", batchID).Count(&count).Error
	return count, err
}

// WithTx returns a new repository with the given transaction
func (r *BatchRepository) WithTx(tx *gorm.DB) *BatchRepository {
	return &BatchRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
