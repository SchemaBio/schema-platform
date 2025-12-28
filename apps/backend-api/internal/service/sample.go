package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"github.com/schema-platform/backend-api/internal/repository"
	"github.com/schema-platform/backend-api/pkg/errors"
	"gorm.io/gorm"
)

// SampleService handles sample operations
type SampleService struct {
	sampleRepo  *repository.SampleRepository
	patientRepo *repository.PatientRepository
	batchRepo   *repository.BatchRepository
}

// NewSampleService creates a new sample service
func NewSampleService(
	sampleRepo *repository.SampleRepository,
	patientRepo *repository.PatientRepository,
	batchRepo *repository.BatchRepository,
) *SampleService {
	return &SampleService{
		sampleRepo:  sampleRepo,
		patientRepo: patientRepo,
		batchRepo:   batchRepo,
	}
}

// CreateSample creates a new sample
func (s *SampleService) CreateSample(ctx context.Context, req *dto.SampleCreateRequest, createdBy string) (*dto.SampleResponse, error) {
	// Parse patient ID
	patientID, err := uuid.Parse(req.PatientID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid patient ID")
	}

	// Check if patient exists
	exists, err := s.patientRepo.Exists(ctx, patientID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}
	if !exists {
		return nil, errors.NewNotFoundError("Patient")
	}

	// Parse creator ID
	creatorID, err := uuid.Parse(createdBy)
	if err != nil {
		return nil, errors.NewValidationError("Invalid creator ID")
	}

	// Parse batch ID if provided
	var batchID *uuid.UUID
	if req.BatchID != nil && *req.BatchID != "" {
		id, err := uuid.Parse(*req.BatchID)
		if err != nil {
			return nil, errors.NewValidationError("Invalid batch ID")
		}
		// Check if batch exists
		exists, err := s.batchRepo.Exists(ctx, id)
		if err != nil {
			return nil, errors.WrapDatabaseError(err)
		}
		if !exists {
			return nil, errors.NewNotFoundError("Batch")
		}
		batchID = &id
	}

	// Create sample
	sample := &model.Sample{
		Name:       req.Name,
		PatientID:  patientID,
		SampleType: model.SampleType(req.SampleType),
		Status:     model.SampleStatusPending,
		BatchID:    batchID,
		CreatedBy:  creatorID,
	}

	if err := s.sampleRepo.Create(ctx, sample); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toSampleResponse(sample), nil
}

// GetSample retrieves a sample by ID
func (s *SampleService) GetSample(ctx context.Context, sampleID string) (*dto.SampleResponse, error) {
	id, err := uuid.Parse(sampleID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid sample ID")
	}

	sample, err := s.sampleRepo.GetByID(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("Sample")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toSampleResponse(sample), nil
}

// GetSamples retrieves all samples with pagination and filtering
func (s *SampleService) GetSamples(ctx context.Context, params *dto.SampleQueryParams) (*dto.SampleListResponse, error) {
	samples, total, err := s.sampleRepo.GetAll(ctx, params)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.SampleResponse, len(samples))
	for i, sample := range samples {
		items[i] = *s.toSampleResponse(&sample)
	}

	page := params.GetPage()
	pageSize := params.GetPageSize()
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &dto.SampleListResponse{
		Items:      items,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// UpdateSample updates a sample
func (s *SampleService) UpdateSample(ctx context.Context, sampleID string, req *dto.SampleUpdateRequest) (*dto.SampleResponse, error) {
	id, err := uuid.Parse(sampleID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid sample ID")
	}

	sample, err := s.sampleRepo.GetByID(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("Sample")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	// Update fields
	if req.Name != nil {
		sample.Name = *req.Name
	}
	if req.Status != nil {
		sample.Status = model.SampleStatus(*req.Status)
	}
	if req.BatchID != nil {
		if *req.BatchID == "" {
			sample.BatchID = nil
		} else {
			batchID, err := uuid.Parse(*req.BatchID)
			if err != nil {
				return nil, errors.NewValidationError("Invalid batch ID")
			}
			sample.BatchID = &batchID
		}
	}

	if err := s.sampleRepo.Update(ctx, sample); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toSampleResponse(sample), nil
}

// DeleteSample soft deletes a sample
func (s *SampleService) DeleteSample(ctx context.Context, sampleID string) error {
	id, err := uuid.Parse(sampleID)
	if err != nil {
		return errors.NewValidationError("Invalid sample ID")
	}

	// Check if sample exists
	exists, err := s.sampleRepo.Exists(ctx, id)
	if err != nil {
		return errors.WrapDatabaseError(err)
	}
	if !exists {
		return errors.NewNotFoundError("Sample")
	}

	if err := s.sampleRepo.SoftDelete(ctx, id); err != nil {
		return errors.WrapDatabaseError(err)
	}

	return nil
}

// GetSamplesByPatient retrieves all samples for a patient
func (s *SampleService) GetSamplesByPatient(ctx context.Context, patientID string) ([]dto.SampleResponse, error) {
	id, err := uuid.Parse(patientID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid patient ID")
	}

	samples, err := s.sampleRepo.GetByPatientID(ctx, id)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.SampleResponse, len(samples))
	for i, sample := range samples {
		items[i] = *s.toSampleResponse(&sample)
	}

	return items, nil
}

// toSampleResponse converts a sample model to a response DTO
func (s *SampleService) toSampleResponse(sample *model.Sample) *dto.SampleResponse {
	var batchID *string
	if sample.BatchID != nil {
		id := sample.BatchID.String()
		batchID = &id
	}

	return &dto.SampleResponse{
		ID:         sample.ID.String(),
		Name:       sample.Name,
		PatientID:  sample.PatientID.String(),
		SampleType: string(sample.SampleType),
		Status:     string(sample.Status),
		BatchID:    batchID,
		CreatedBy:  sample.CreatedBy.String(),
		CreatedAt:  sample.CreatedAt,
		UpdatedAt:  sample.UpdatedAt,
	}
}
