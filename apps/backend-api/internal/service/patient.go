package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"github.com/schema-platform/backend-api/internal/repository"
	"github.com/schema-platform/backend-api/pkg/errors"
	"gorm.io/gorm"
)

// PatientService handles patient operations (legacy)
type PatientService struct {
	patientRepo *repository.PatientRepository
}

// NewPatientService creates a new patient service
func NewPatientService(patientRepo *repository.PatientRepository, sampleRepo *repository.SampleRepository) *PatientService {
	return &PatientService{
		patientRepo: patientRepo,
	}
}

// CreatePatient creates a new patient
func (s *PatientService) CreatePatient(ctx context.Context, req *dto.PatientCreateRequest, createdBy string) (*dto.PatientResponse, error) {
	creatorID, err := uuid.Parse(createdBy)
	if err != nil {
		return nil, errors.NewValidationError("Invalid creator ID")
	}

	gender := model.GenderUnknown
	if req.Gender != "" {
		gender = model.Gender(req.Gender)
	}

	patient := &model.Patient{
		Name:       req.Name,
		Gender:     gender,
		Phenotypes: req.Phenotypes,
		CreatedBy:  creatorID,
	}

	if req.BirthDate != nil && *req.BirthDate != "" {
		birthDate, err := time.Parse("2006-01-02", *req.BirthDate)
		if err != nil {
			return nil, errors.NewValidationError("Invalid birth date format, use YYYY-MM-DD")
		}
		patient.BirthDate = &birthDate
	}

	if err := s.patientRepo.Create(ctx, patient); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toPatientResponse(patient), nil
}

// GetPatient retrieves a patient by ID
func (s *PatientService) GetPatient(ctx context.Context, patientID string) (*dto.PatientResponse, error) {
	id, err := uuid.Parse(patientID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid patient ID")
	}

	patient, err := s.patientRepo.GetByID(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("Patient")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toPatientResponse(patient), nil
}

// GetPatients retrieves all patients with pagination
func (s *PatientService) GetPatients(ctx context.Context, params *dto.PatientQueryParams) (*dto.PatientListResponse, error) {
	patients, total, err := s.patientRepo.GetAll(ctx, params)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.PatientResponse, len(patients))
	for i, patient := range patients {
		items[i] = *s.toPatientResponse(&patient)
	}

	page := params.GetPage()
	pageSize := params.GetPageSize()
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &dto.PatientListResponse{
		Items:      items,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// UpdatePatient updates a patient
func (s *PatientService) UpdatePatient(ctx context.Context, patientID string, req *dto.PatientUpdateRequest) (*dto.PatientResponse, error) {
	id, err := uuid.Parse(patientID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid patient ID")
	}

	patient, err := s.patientRepo.GetByID(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("Patient")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	if req.Name != nil {
		patient.Name = *req.Name
	}
	if req.Gender != nil {
		patient.Gender = model.Gender(*req.Gender)
	}
	if req.BirthDate != nil && *req.BirthDate != "" {
		birthDate, err := time.Parse("2006-01-02", *req.BirthDate)
		if err != nil {
			return nil, errors.NewValidationError("Invalid birth date format, use YYYY-MM-DD")
		}
		patient.BirthDate = &birthDate
	}
	if req.Phenotypes != nil {
		patient.Phenotypes = req.Phenotypes
	}

	if err := s.patientRepo.Update(ctx, patient); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toPatientResponse(patient), nil
}

// DeletePatient soft deletes a patient
func (s *PatientService) DeletePatient(ctx context.Context, patientID string) error {
	id, err := uuid.Parse(patientID)
	if err != nil {
		return errors.NewValidationError("Invalid patient ID")
	}

	exists, err := s.patientRepo.Exists(ctx, id)
	if err != nil {
		return errors.WrapDatabaseError(err)
	}
	if !exists {
		return errors.NewNotFoundError("Patient")
	}

	return s.patientRepo.SoftDelete(ctx, id)
}

func (s *PatientService) toPatientResponse(patient *model.Patient) *dto.PatientResponse {
	var birthDate *string
	if patient.BirthDate != nil {
		bd := patient.BirthDate.Format("2006-01-02")
		birthDate = &bd
	}

	return &dto.PatientResponse{
		ID:         patient.ID.String(),
		Name:       patient.Name,
		Gender:     string(patient.Gender),
		BirthDate:  birthDate,
		Phenotypes: patient.Phenotypes,
		CreatedBy:  patient.CreatedBy.String(),
		CreatedAt:  patient.CreatedAt,
		UpdatedAt:  patient.UpdatedAt,
	}
}
