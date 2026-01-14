package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// SampleRepository handles sample data access for Somatic system
type SampleRepository struct {
	*BaseRepository[model.Sample]
}

// NewSampleRepository creates a new sample repository
func NewSampleRepository(db *gorm.DB) *SampleRepository {
	return &SampleRepository{
		BaseRepository: NewBaseRepository[model.Sample](db),
	}
}

// GetAll retrieves all samples with pagination and filtering
func (r *SampleRepository) GetAll(ctx context.Context, params *dto.SampleQueryParams) ([]model.Sample, int64, error) {
	var samples []model.Sample
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.Sample{})

	// Apply filters
	if params.Status != nil && *params.Status != "" {
		query = query.Where("status = ?", *params.Status)
	}
	if params.TumorType != nil && *params.TumorType != "" {
		query = query.Where("tumor_type = ?", *params.TumorType)
	}
	if params.Hospital != nil && *params.Hospital != "" {
		query = query.Where("hospital = ?", *params.Hospital)
	}
	if params.SampleType != nil && *params.SampleType != "" {
		query = query.Where("sample_type = ?", *params.SampleType)
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
	if err := query.Offset(offset).Limit(limit).Find(&samples).Error; err != nil {
		return nil, 0, err
	}

	return samples, total, nil
}

// UpdateStatus updates a sample's status
func (r *SampleRepository) UpdateStatus(ctx context.Context, sampleID uuid.UUID, status model.SomaticSampleStatus) error {
	return r.DB().WithContext(ctx).Model(&model.Sample{}).Where("id = ?", sampleID).Update("status", status).Error
}

// WithTx returns a new repository with the given transaction
func (r *SampleRepository) WithTx(tx *gorm.DB) *SampleRepository {
	return &SampleRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
