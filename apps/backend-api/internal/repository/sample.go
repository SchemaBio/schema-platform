package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// SampleRepository handles sample data access
type SampleRepository struct {
	*BaseRepository[model.Sample]
}

// NewSampleRepository creates a new sample repository
func NewSampleRepository(db *gorm.DB) *SampleRepository {
	return &SampleRepository{
		BaseRepository: NewBaseRepository[model.Sample](db),
	}
}

// GetByPatientID retrieves all samples for a patient
func (r *SampleRepository) GetByPatientID(ctx context.Context, patientID uuid.UUID) ([]model.Sample, error) {
	var samples []model.Sample
	err := r.DB().WithContext(ctx).Where("patient_id = ?", patientID).Find(&samples).Error
	return samples, err
}

// GetByBatchID retrieves all samples in a batch
func (r *SampleRepository) GetByBatchID(ctx context.Context, batchID uuid.UUID) ([]model.Sample, error) {
	var samples []model.Sample
	err := r.DB().WithContext(ctx).Where("batch_id = ?", batchID).Find(&samples).Error
	return samples, err
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
	if params.PatientID != nil && *params.PatientID != "" {
		query = query.Where("patient_id = ?", *params.PatientID)
	}
	if params.BatchID != nil && *params.BatchID != "" {
		query = query.Where("batch_id = ?", *params.BatchID)
	}
	if params.StartDate != nil && *params.StartDate != "" {
		startDate, err := time.Parse("2006-01-02", *params.StartDate)
		if err == nil {
			query = query.Where("created_at >= ?", startDate)
		}
	}
	if params.EndDate != nil && *params.EndDate != "" {
		endDate, err := time.Parse("2006-01-02", *params.EndDate)
		if err == nil {
			// Add one day to include the end date
			endDate = endDate.Add(24 * time.Hour)
			query = query.Where("created_at < ?", endDate)
		}
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
func (r *SampleRepository) UpdateStatus(ctx context.Context, sampleID uuid.UUID, status model.SampleStatus) error {
	return r.DB().WithContext(ctx).Model(&model.Sample{}).Where("id = ?", sampleID).Update("status", status).Error
}

// SetBatch sets the batch ID for a sample
func (r *SampleRepository) SetBatch(ctx context.Context, sampleID, batchID uuid.UUID) error {
	return r.DB().WithContext(ctx).Model(&model.Sample{}).Where("id = ?", sampleID).Update("batch_id", batchID).Error
}

// RemoveFromBatch removes a sample from its batch
func (r *SampleRepository) RemoveFromBatch(ctx context.Context, sampleID uuid.UUID) error {
	return r.DB().WithContext(ctx).Model(&model.Sample{}).Where("id = ?", sampleID).Update("batch_id", nil).Error
}

// GetByIDs retrieves samples by their IDs
func (r *SampleRepository) GetByIDs(ctx context.Context, ids []uuid.UUID) ([]model.Sample, error) {
	var samples []model.Sample
	err := r.DB().WithContext(ctx).Where("id IN ?", ids).Find(&samples).Error
	return samples, err
}

// WithTx returns a new repository with the given transaction
func (r *SampleRepository) WithTx(tx *gorm.DB) *SampleRepository {
	return &SampleRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
