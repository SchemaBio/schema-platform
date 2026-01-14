package repository

import (
	"context"

	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// BaselineFileRepository handles baseline file data access
type BaselineFileRepository struct {
	*BaseRepository[model.BaselineFile]
}

// NewBaselineFileRepository creates a new baseline file repository
func NewBaselineFileRepository(db *gorm.DB) *BaselineFileRepository {
	return &BaselineFileRepository{
		BaseRepository: NewBaseRepository[model.BaselineFile](db),
	}
}

// GetByType retrieves baseline files by type
func (r *BaselineFileRepository) GetByType(ctx context.Context, baselineType model.BaselineType) ([]model.BaselineFile, error) {
	var files []model.BaselineFile
	err := r.DB().WithContext(ctx).Where("baseline_type = ?", baselineType).Find(&files).Error
	return files, err
}

// GetByName retrieves a baseline file by name
func (r *BaselineFileRepository) GetByName(ctx context.Context, name string) (*model.BaselineFile, error) {
	var file model.BaselineFile
	err := r.DB().WithContext(ctx).Where("name = ?", name).First(&file).Error
	if err != nil {
		return nil, err
	}
	return &file, nil
}

// GetByVersion retrieves baseline files by version
func (r *BaselineFileRepository) GetByVersion(ctx context.Context, baselineType model.BaselineType, version string) ([]model.BaselineFile, error) {
	var files []model.BaselineFile
	err := r.DB().WithContext(ctx).
		Where("baseline_type = ? AND version = ?", baselineType, version).
		Find(&files).Error
	return files, err
}

// GetAll retrieves all baseline files with pagination
func (r *BaselineFileRepository) GetAll(ctx context.Context, params *dto.PaginatedRequest) ([]model.BaselineFile, int64, error) {
	var files []model.BaselineFile
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.BaselineFile{})

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
func (r *BaselineFileRepository) WithTx(tx *gorm.DB) *BaselineFileRepository {
	return &BaselineFileRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
