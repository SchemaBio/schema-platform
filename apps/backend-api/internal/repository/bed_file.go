package repository

import (
	"context"

	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// BEDFileRepository handles BED file data access
type BEDFileRepository struct {
	*BaseRepository[model.BEDFile]
}

// NewBEDFileRepository creates a new BED file repository
func NewBEDFileRepository(db *gorm.DB) *BEDFileRepository {
	return &BEDFileRepository{
		BaseRepository: NewBaseRepository[model.BEDFile](db),
	}
}

// GetByName retrieves a BED file by name
func (r *BEDFileRepository) GetByName(ctx context.Context, name string) (*model.BEDFile, error) {
	var file model.BEDFile
	err := r.DB().WithContext(ctx).Where("name = ?", name).First(&file).Error
	if err != nil {
		return nil, err
	}
	return &file, nil
}

// GetByPanelVersion retrieves BED files by panel version
func (r *BEDFileRepository) GetByPanelVersion(ctx context.Context, version string) ([]model.BEDFile, error) {
	var files []model.BEDFile
	err := r.DB().WithContext(ctx).Where("panel_version = ?", version).Find(&files).Error
	return files, err
}

// GetAll retrieves all BED files with pagination
func (r *BEDFileRepository) GetAll(ctx context.Context, params *dto.PaginatedRequest) ([]model.BEDFile, int64, error) {
	var files []model.BEDFile
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.BEDFile{})

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
func (r *BEDFileRepository) WithTx(tx *gorm.DB) *BEDFileRepository {
	return &BEDFileRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
