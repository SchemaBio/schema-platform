package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// PatientRepository handles patient data access
type PatientRepository struct {
	*BaseRepository[model.Patient]
}

// NewPatientRepository creates a new patient repository
func NewPatientRepository(db *gorm.DB) *PatientRepository {
	return &PatientRepository{
		BaseRepository: NewBaseRepository[model.Patient](db),
	}
}

// GetAll retrieves all patients with pagination and filtering
func (r *PatientRepository) GetAll(ctx context.Context, params *dto.PatientQueryParams) ([]model.Patient, int64, error) {
	var patients []model.Patient
	var total int64

	query := r.DB().WithContext(ctx).Model(&model.Patient{})

	// Apply filters
	if params.Name != nil && *params.Name != "" {
		query = query.Where("name ILIKE ?", "%"+*params.Name+"%")
	}
	if params.Gender != nil && *params.Gender != "" {
		query = query.Where("gender = ?", *params.Gender)
	}
	if params.Phenotype != nil && *params.Phenotype != "" {
		query = query.Where("phenotypes @> ?", `["`+*params.Phenotype+`"]`)
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
	if err := query.Offset(offset).Limit(limit).Find(&patients).Error; err != nil {
		return nil, 0, err
	}

	return patients, total, nil
}

// GetWithSamples retrieves a patient with their samples
func (r *PatientRepository) GetWithSamples(ctx context.Context, patientID uuid.UUID) (*model.Patient, error) {
	var patient model.Patient
	err := r.DB().WithContext(ctx).Preload("Samples").Where("id = ?", patientID).First(&patient).Error
	if err != nil {
		return nil, err
	}
	return &patient, nil
}

// Search searches patients by name or phenotype
func (r *PatientRepository) Search(ctx context.Context, query string, limit int) ([]model.Patient, error) {
	var patients []model.Patient
	err := r.DB().WithContext(ctx).
		Where("name ILIKE ? OR phenotypes::text ILIKE ?", "%"+query+"%", "%"+query+"%").
		Limit(limit).
		Find(&patients).Error
	return patients, err
}

// WithTx returns a new repository with the given transaction
func (r *PatientRepository) WithTx(tx *gorm.DB) *PatientRepository {
	return &PatientRepository{
		BaseRepository: r.BaseRepository.WithTx(tx),
	}
}
