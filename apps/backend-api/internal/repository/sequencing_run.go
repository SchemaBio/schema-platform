package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// SequencingRunRepository handles sequencing run data access
type SequencingRunRepository struct {
	*BaseRepository[model.SequencingRun]
}

// NewSequencingRunRepository creates a new sequencing run repository
func NewSequencingRunRepository(db *gorm.DB) *SequencingRunRepository {
	return &SequencingRunRepository{
		BaseRepository: NewBaseRepository[model.SequencingRun](db),
	}
}

// GetBySequencerID retrieves all runs for a sequencer
func (r *SequencingRunRepository) GetBySequencerID(ctx context.Context, sequencerID uuid.UUID) ([]model.SequencingRun, error) {
	var runs []model.SequencingRun
	err := r.DB().WithContext(ctx).Where("sequencer_id = ?", sequencerID).Find(&runs).Error
	return runs, err
}

// GetByStatus retrieves runs by status
func (r *SequencingRunRepository) GetByStatus(ctx context.Context, status model.SequencingRunStatus) ([]model.SequencingRun, error) {
	var runs []model.SequencingRun
	err := r.DB().WithContext(ctx).Where("status = ?", status).Find(&runs).Error
	return runs, err
}

// GetAll retrieves all runs with pagination
func (r *SequencingRunRepository) GetAll(ctx context.Context, params *dto.PaginatedRequest) ([]model.SequencingRun, int64, error) {
	var runs []model.SequencingRun
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.SequencingRun{})

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
	if err := query.Offset(offset).Limit(limit).Find(&runs).Error; err != nil {
		return nil, 0, err
	}

	return runs, total, nil
}

// UpdateStatus updates a run's status
func (r *SequencingRunRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status model.SequencingRunStatus) error {
	return r.DB().WithContext(ctx).Model(&model.SequencingRun{}).Where("id = ?", id).Update("status", status).Error
}

// WithTx returns a new repository with the given transaction
func (r *SequencingRunRepository) WithTx(tx *gorm.DB) *SequencingRunRepository {
	return &SequencingRunRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
