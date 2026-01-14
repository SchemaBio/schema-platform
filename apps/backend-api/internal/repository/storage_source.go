package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// StorageSourceRepository handles storage source data access
type StorageSourceRepository struct {
	*BaseRepository[model.StorageSource]
}

// NewStorageSourceRepository creates a new storage source repository
func NewStorageSourceRepository(db *gorm.DB) *StorageSourceRepository {
	return &StorageSourceRepository{
		BaseRepository: NewBaseRepository[model.StorageSource](db),
	}
}

// GetByProtocol retrieves storage sources by protocol
func (r *StorageSourceRepository) GetByProtocol(ctx context.Context, protocol model.StorageProtocol) ([]model.StorageSource, error) {
	var sources []model.StorageSource
	err := r.DB().WithContext(ctx).Where("protocol = ?", protocol).Find(&sources).Error
	return sources, err
}

// GetDefault retrieves the default storage source
func (r *StorageSourceRepository) GetDefault(ctx context.Context) (*model.StorageSource, error) {
	var source model.StorageSource
	err := r.DB().WithContext(ctx).Where("is_default = ?", true).First(&source).Error
	if err != nil {
		return nil, err
	}
	return &source, nil
}

// GetByName retrieves a storage source by name
func (r *StorageSourceRepository) GetByName(ctx context.Context, name string) (*model.StorageSource, error) {
	var source model.StorageSource
	err := r.DB().WithContext(ctx).Where("name = ?", name).First(&source).Error
	if err != nil {
		return nil, err
	}
	return &source, nil
}

// GetAll retrieves all storage sources with pagination
func (r *StorageSourceRepository) GetAll(ctx context.Context, params *dto.PaginatedRequest) ([]model.StorageSource, int64, error) {
	var sources []model.StorageSource
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.StorageSource{})

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
	if err := query.Offset(offset).Limit(limit).Find(&sources).Error; err != nil {
		return nil, 0, err
	}

	return sources, total, nil
}

// ClearDefault clears the default flag from all sources
func (r *StorageSourceRepository) ClearDefault(ctx context.Context) error {
	return r.DB().WithContext(ctx).Model(&model.StorageSource{}).Where("is_default = ?", true).
		Update("is_default", false).Error
}

// SetAsDefault sets a storage source as default
func (r *StorageSourceRepository) SetAsDefault(ctx context.Context, id uuid.UUID) error {
	// Clear all defaults first
	if err := r.ClearDefault(ctx); err != nil {
		return err
	}
	// Set the new default
	return r.DB().WithContext(ctx).Model(&model.StorageSource{}).Where("id = ?", id).
		Update("is_default", true).Error
}

// WithTx returns a new repository with the given transaction
func (r *StorageSourceRepository) WithTx(tx *gorm.DB) *StorageSourceRepository {
	return &StorageSourceRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
