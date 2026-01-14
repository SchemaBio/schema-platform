package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// SequencerRepository handles sequencer data access
type SequencerRepository struct {
	*BaseRepository[model.Sequencer]
}

// NewSequencerRepository creates a new sequencer repository
func NewSequencerRepository(db *gorm.DB) *SequencerRepository {
	return &SequencerRepository{
		BaseRepository: NewBaseRepository[model.Sequencer](db),
	}
}

// GetByPlatform retrieves sequencers by platform type
func (r *SequencerRepository) GetByPlatform(ctx context.Context, platform model.SequencerPlatform) ([]model.Sequencer, error) {
	var sequencers []model.Sequencer
	err := r.DB().WithContext(ctx).Where("platform = ?", platform).Find(&sequencers).Error
	return sequencers, err
}

// GetByStatus retrieves sequencers by status
func (r *SequencerRepository) GetByStatus(ctx context.Context, status model.SequencerStatus) ([]model.Sequencer, error) {
	var sequencers []model.Sequencer
	err := r.DB().WithContext(ctx).Where("status = ?", status).Find(&sequencers).Error
	return sequencers, err
}

// GetAll retrieves all sequencers with pagination
func (r *SequencerRepository) GetAll(ctx context.Context, params *dto.PaginatedRequest) ([]model.Sequencer, int64, error) {
	var sequencers []model.Sequencer
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.Sequencer{})

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
	if err := query.Offset(offset).Limit(limit).Find(&sequencers).Error; err != nil {
		return nil, 0, err
	}

	return sequencers, total, nil
}

// UpdateStatus updates a sequencer's status
func (r *SequencerRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status model.SequencerStatus) error {
	return r.DB().WithContext(ctx).Model(&model.Sequencer{}).Where("id = ?", id).Update("status", status).Error
}

// WithTx returns a new repository with the given transaction
func (r *SequencerRepository) WithTx(tx *gorm.DB) *SequencerRepository {
	return &SequencerRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
