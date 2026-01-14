package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// AnalysisTaskRepository handles analysis task data access
type AnalysisTaskRepository struct {
	*BaseRepository[model.AnalysisTask]
}

// NewAnalysisTaskRepository creates a new analysis task repository
func NewAnalysisTaskRepository(db *gorm.DB) *AnalysisTaskRepository {
	return &AnalysisTaskRepository{
		BaseRepository: NewBaseRepository[model.AnalysisTask](db),
	}
}

// GetBySampleID retrieves all tasks for a sample
func (r *AnalysisTaskRepository) GetBySampleID(ctx context.Context, sampleID uuid.UUID) ([]model.AnalysisTask, error) {
	var tasks []model.AnalysisTask
	err := r.DB().WithContext(ctx).Where("sample_id = ?", sampleID).Find(&tasks).Error
	return tasks, err
}

// GetByPipelineID retrieves all tasks for a pipeline
func (r *AnalysisTaskRepository) GetByPipelineID(ctx context.Context, pipelineID uuid.UUID) ([]model.AnalysisTask, error) {
	var tasks []model.AnalysisTask
	err := r.DB().WithContext(ctx).Where("pipeline_id = ?", pipelineID).Find(&tasks).Error
	return tasks, err
}

// GetByStatus retrieves tasks by status
func (r *AnalysisTaskRepository) GetByStatus(ctx context.Context, status model.AnalysisTaskStatus) ([]model.AnalysisTask, error) {
	var tasks []model.AnalysisTask
	err := r.DB().WithContext(ctx).Where("status = ?", status).Find(&tasks).Error
	return tasks, err
}

// GetAll retrieves all tasks with pagination
func (r *AnalysisTaskRepository) GetAll(ctx context.Context, params *dto.AnalysisTaskQueryParams) ([]model.AnalysisTask, int64, error) {
	var tasks []model.AnalysisTask
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.AnalysisTask{})

	// Apply filters
	if params.SampleID != nil {
		query = query.Where("sample_id = ?", *params.SampleID)
	}
	if params.PipelineID != nil {
		query = query.Where("pipeline_id = ?", *params.PipelineID)
	}
	if params.Status != nil {
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
	if err := query.Offset(offset).Limit(limit).Find(&tasks).Error; err != nil {
		return nil, 0, err
	}

	return tasks, total, nil
}

// UpdateStatus updates a task's status
func (r *AnalysisTaskRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status model.AnalysisTaskStatus) error {
	return r.DB().WithContext(ctx).Model(&model.AnalysisTask{}).Where("id = ?", id).Update("status", status).Error
}

// WithTx returns a new repository with the given transaction
func (r *AnalysisTaskRepository) WithTx(tx *gorm.DB) *AnalysisTaskRepository {
	return &AnalysisTaskRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
