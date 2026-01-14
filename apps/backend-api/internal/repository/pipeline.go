package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// PipelineRepository handles pipeline data access
type PipelineRepository struct {
	*BaseRepository[model.Pipeline]
}

// NewPipelineRepository creates a new pipeline repository
func NewPipelineRepository(db *gorm.DB) *PipelineRepository {
	return &PipelineRepository{
		BaseRepository: NewBaseRepository[model.Pipeline](db),
	}
}

// GetByBasePipeline retrieves pipelines by base pipeline type
func (r *PipelineRepository) GetByBasePipeline(ctx context.Context, basePipeline model.BasePipelineType) ([]model.Pipeline, error) {
	var pipelines []model.Pipeline
	err := r.DB().WithContext(ctx).Where("base_pipeline = ?", basePipeline).Find(&pipelines).Error
	return pipelines, err
}

// GetActive retrieves all active pipelines
func (r *PipelineRepository) GetActive(ctx context.Context) ([]model.Pipeline, error) {
	var pipelines []model.Pipeline
	err := r.DB().WithContext(ctx).Where("status = ?", model.PipelineStatusActive).Find(&pipelines).Error
	return pipelines, err
}

// GetByName retrieves a pipeline by name
func (r *PipelineRepository) GetByName(ctx context.Context, name string) (*model.Pipeline, error) {
	var pipeline model.Pipeline
	err := r.DB().WithContext(ctx).Where("name = ?", name).First(&pipeline).Error
	if err != nil {
		return nil, err
	}
	return &pipeline, nil
}

// GetByVersion retrieves a pipeline by name and version
func (r *PipelineRepository) GetByVersion(ctx context.Context, name, version string) (*model.Pipeline, error) {
	var pipeline model.Pipeline
	err := r.DB().WithContext(ctx).Where("name = ? AND version = ?", name, version).First(&pipeline).Error
	if err != nil {
		return nil, err
	}
	return &pipeline, nil
}

// GetAll retrieves all pipelines with pagination
func (r *PipelineRepository) GetAll(ctx context.Context, params *dto.PaginatedRequest) ([]model.Pipeline, int64, error) {
	var pipelines []model.Pipeline
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.Pipeline{})

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
	if err := query.Offset(offset).Limit(limit).Find(&pipelines).Error; err != nil {
		return nil, 0, err
	}

	return pipelines, total, nil
}

// UpdateStatus updates a pipeline's status
func (r *PipelineRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status model.PipelineStatus) error {
	return r.DB().WithContext(ctx).Model(&model.Pipeline{}).Where("id = ?", id).Update("status", status).Error
}

// WithTx returns a new repository with the given transaction
func (r *PipelineRepository) WithTx(tx *gorm.DB) *PipelineRepository {
	return &PipelineRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
