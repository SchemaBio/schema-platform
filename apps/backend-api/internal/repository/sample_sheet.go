package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// SampleSheetRepository handles sample sheet data access
type SampleSheetRepository struct {
	*BaseRepository[model.SampleSheet]
}

// NewSampleSheetRepository creates a new sample sheet repository
func NewSampleSheetRepository(db *gorm.DB) *SampleSheetRepository {
	return &SampleSheetRepository{
		BaseRepository: NewBaseRepository[model.SampleSheet](db),
	}
}

// GetByRunID retrieves sample sheets for a run
func (r *SampleSheetRepository) GetByRunID(ctx context.Context, runID uuid.UUID) ([]model.SampleSheet, error) {
	var sheets []model.SampleSheet
	err := r.DB().WithContext(ctx).Where("run_id = ?", runID).Find(&sheets).Error
	return sheets, err
}

// GetBySequencerID retrieves sample sheets for a sequencer
func (r *SampleSheetRepository) GetBySequencerID(ctx context.Context, sequencerID uuid.UUID) ([]model.SampleSheet, error) {
	var sheets []model.SampleSheet
	err := r.DB().WithContext(ctx).Where("sequencer_id = ?", sequencerID).Find(&sheets).Error
	return sheets, err
}

// GetByStatus retrieves sample sheets by status
func (r *SampleSheetRepository) GetByStatus(ctx context.Context, status model.SampleSheetStatus) ([]model.SampleSheet, error) {
	var sheets []model.SampleSheet
	err := r.DB().WithContext(ctx).Where("status = ?", status).Find(&sheets).Error
	return sheets, err
}

// GetAll retrieves all sample sheets with pagination
func (r *SampleSheetRepository) GetAll(ctx context.Context, params *dto.PaginatedRequest) ([]model.SampleSheet, int64, error) {
	var sheets []model.SampleSheet
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.SampleSheet{})

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
	if err := query.Offset(offset).Limit(limit).Find(&sheets).Error; err != nil {
		return nil, 0, err
	}

	return sheets, total, nil
}

// UpdateStatus updates a sample sheet's status
func (r *SampleSheetRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status model.SampleSheetStatus) error {
	return r.DB().WithContext(ctx).Model(&model.SampleSheet{}).Where("id = ?", id).Update("status", status).Error
}

// IncrementMatchedCount increments the matched count
func (r *SampleSheetRepository) IncrementMatchedCount(ctx context.Context, id uuid.UUID) error {
	return r.DB().WithContext(ctx).Model(&model.SampleSheet{}).Where("id = ?", id).
		Update("matched_count", gorm.Expr("matched_count + 1")).Error
}

// IncrementUnmatchedCount increments the unmatched count
func (r *SampleSheetRepository) IncrementUnmatchedCount(ctx context.Context, id uuid.UUID) error {
	return r.DB().WithContext(ctx).Model(&model.SampleSheet{}).Where("id = ?", id).
		Update("unmatched_count", gorm.Expr("unmatched_count + 1")).Error
}

// WithTx returns a new repository with the given transaction
func (r *SampleSheetRepository) WithTx(tx *gorm.DB) *SampleSheetRepository {
	return &SampleSheetRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
