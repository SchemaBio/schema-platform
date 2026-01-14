package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// DataFileRepository handles data file data access
type DataFileRepository struct {
	*BaseRepository[model.DataFile]
}

// NewDataFileRepository creates a new data file repository
func NewDataFileRepository(db *gorm.DB) *DataFileRepository {
	return &DataFileRepository{
		BaseRepository: NewBaseRepository[model.DataFile](db),
	}
}

// GetBySampleID retrieves all files for a sample
func (r *DataFileRepository) GetBySampleID(ctx context.Context, sampleID uuid.UUID) ([]model.DataFile, error) {
	var files []model.DataFile
	err := r.DB().WithContext(ctx).Where("sample_id = ?", sampleID).Find(&files).Error
	return files, err
}

// GetByRunID retrieves all files for a run
func (r *DataFileRepository) GetByRunID(ctx context.Context, runID uuid.UUID) ([]model.DataFile, error) {
	var files []model.DataFile
	err := r.DB().WithContext(ctx).Where("run_id = ?", runID).Find(&files).Error
	return files, err
}

// GetByStatus retrieves files by status
func (r *DataFileRepository) GetByStatus(ctx context.Context, status model.DataFileStatus) ([]model.DataFile, error) {
	var files []model.DataFile
	err := r.DB().WithContext(ctx).Where("status = ?", status).Find(&files).Error
	return files, err
}

// GetByLane retrieves files by lane
func (r *DataFileRepository) GetByLane(ctx context.Context, sampleID, runID uuid.UUID, lane string) ([]model.DataFile, error) {
	var files []model.DataFile
	err := r.DB().WithContext(ctx).
		Where("sample_id = ? AND run_id = ? AND lane = ?", sampleID, runID, lane).
		Find(&files).Error
	return files, err
}

// GetAll retrieves all files with pagination
func (r *DataFileRepository) GetAll(ctx context.Context, params *dto.PaginatedRequest) ([]model.DataFile, int64, error) {
	var files []model.DataFile
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.DataFile{})

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

// UpdateStatus updates a file's status
func (r *DataFileRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status model.DataFileStatus) error {
	return r.DB().WithContext(ctx).Model(&model.DataFile{}).Where("id = ?", id).Update("status", status).Error
}

// WithTx returns a new repository with the given transaction
func (r *DataFileRepository) WithTx(tx *gorm.DB) *DataFileRepository {
	return &DataFileRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
