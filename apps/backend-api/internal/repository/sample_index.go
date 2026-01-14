package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// SampleIndexRepository handles sample index data access
type SampleIndexRepository struct {
	*BaseRepository[model.SampleIndex]
}

// NewSampleIndexRepository creates a new sample index repository
func NewSampleIndexRepository(db *gorm.DB) *SampleIndexRepository {
	return &SampleIndexRepository{
		BaseRepository: NewBaseRepository[model.SampleIndex](db),
	}
}

// GetBySampleSheetID retrieves all indices for a sample sheet
func (r *SampleIndexRepository) GetBySampleSheetID(ctx context.Context, sheetID uuid.UUID) ([]model.SampleIndex, error) {
	var indices []model.SampleIndex
	err := r.DB().WithContext(ctx).Where("sample_sheet_id = ?", sheetID).Find(&indices).Error
	return indices, err
}

// GetBySampleID retrieves all indices for a sample
func (r *SampleIndexRepository) GetBySampleID(ctx context.Context, sampleID uuid.UUID) ([]model.SampleIndex, error) {
	var indices []model.SampleIndex
	err := r.DB().WithContext(ctx).Where("sample_id = ?", sampleID).Find(&indices).Error
	return indices, err
}

// GetUnmatched retrieves unmatched indices
func (r *SampleIndexRepository) GetUnmatched(ctx context.Context, sheetID uuid.UUID) ([]model.SampleIndex, error) {
	var indices []model.SampleIndex
	err := r.DB().WithContext(ctx).Where("sample_sheet_id = ? AND matched = ?", sheetID, false).Find(&indices).Error
	return indices, err
}

// GetAll retrieves all indices with pagination
func (r *SampleIndexRepository) GetAll(ctx context.Context, params *dto.PaginatedRequest) ([]model.SampleIndex, int64, error) {
	var indices []model.SampleIndex
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.SampleIndex{})

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
	if err := query.Offset(offset).Limit(limit).Find(&indices).Error; err != nil {
		return nil, 0, err
	}

	return indices, total, nil
}

// MarkAsMatched marks an index as matched
func (r *SampleIndexRepository) MarkAsMatched(ctx context.Context, id uuid.UUID, sampleID uuid.UUID) error {
	return r.DB().WithContext(ctx).Model(&model.SampleIndex{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"matched":    true,
			"sample_id": sampleID,
		}).Error
}

// WithTx returns a new repository with the given transaction
func (r *SampleIndexRepository) WithTx(tx *gorm.DB) *SampleIndexRepository {
	return &SampleIndexRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
