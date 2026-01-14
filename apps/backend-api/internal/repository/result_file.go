package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// ResultFileRepository handles result file data access
type ResultFileRepository struct {
	*BaseRepository[model.ResultFile]
}

// NewResultFileRepository creates a new result file repository
func NewResultFileRepository(db *gorm.DB) *ResultFileRepository {
	return &ResultFileRepository{
		BaseRepository: NewBaseRepository[model.ResultFile](db),
	}
}

// GetByTaskID retrieves all result files for a task
func (r *ResultFileRepository) GetByTaskID(ctx context.Context, taskID uuid.UUID) ([]model.ResultFile, error) {
	var files []model.ResultFile
	err := r.DB().WithContext(ctx).Where("task_id = ?", taskID).Find(&files).Error
	return files, err
}

// GetByType retrieves result files by type
func (r *ResultFileRepository) GetByType(ctx context.Context, taskID uuid.UUID, resultType model.ResultType) ([]model.ResultFile, error) {
	var files []model.ResultFile
	err := r.DB().WithContext(ctx).Where("task_id = ? AND result_type = ?", taskID, resultType).Find(&files).Error
	return files, err
}

// GetAll retrieves all result files with pagination
func (r *ResultFileRepository) GetAll(ctx context.Context, params *dto.PaginatedRequest) ([]model.ResultFile, int64, error) {
	var files []model.ResultFile
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.ResultFile{})

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
	if err := query.Offset(offset).Limit(limit).Find(&files).Error; err != nil {
		return nil, 0, err
	}

	return files, total, nil
}

// WithTx returns a new repository with the given transaction
func (r *ResultFileRepository) WithTx(tx *gorm.DB) *ResultFileRepository {
	return &ResultFileRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
