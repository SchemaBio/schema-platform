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

// SampleService handles sample operations for Somatic system
type SampleService struct {
	sampleRepo   *repository.SampleRepository
	dataFileRepo *repository.DataFileRepository
}

// NewSampleService creates a new sample service
func NewSampleService(
	sampleRepo *repository.SampleRepository,
	dataFileRepo *repository.DataFileRepository,
) *SampleService {
	return &SampleService{
		sampleRepo:   sampleRepo,
		dataFileRepo: dataFileRepo,
	}
}

// CreateSample creates a new tumor sample
func (s *SampleService) CreateSample(ctx context.Context, req *dto.CreateSampleRequest, createdBy string) (*dto.SampleResponse, error) {
	creatorID, err := uuid.Parse(createdBy)
	if err != nil {
		return nil, errors.NewValidationError("Invalid creator ID")
	}

	// Parse paired sample ID if provided
	var pairedSampleID *uuid.UUID
	if req.PairedSampleID != nil && *req.PairedSampleID != "" {
		id, err := uuid.Parse(*req.PairedSampleID)
		if err != nil {
			return nil, errors.NewValidationError("Invalid paired sample ID")
		}
		pairedSampleID = &id
	}

	sample := &model.Sample{
		InternalID:      req.InternalID,
		Name:            req.Name,
		Gender:          req.Gender,
		Age:             req.Age,
		SampleType:      model.SampleType(req.SampleType),
		NucleicAcidType: model.NucleicAcidType(req.NucleicAcidType),
		TumorType:       req.TumorType,
		PairedSampleID:  pairedSampleID,
		Status:          model.SomaticSampleStatusPending,
		Hospital:        req.Hospital,
		TestItems:       req.TestItems,
		ExtraInfo:       req.ExtraInfo,
		CreatedBy:       creatorID,
	}

	if req.BirthDate != nil {
		sample.BirthDate = req.BirthDate
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

	return s.toPaginatedResponse(items, total, params), nil
}

// UpdateSample updates a sample
func (s *SampleService) UpdateSample(ctx context.Context, sampleID string, req *dto.UpdateSampleRequest) (*dto.SampleResponse, error) {
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
	if req.InternalID != nil {
		sample.InternalID = *req.InternalID
	}
	if req.Name != nil {
		sample.Name = *req.Name
	}
	if req.Gender != nil {
		sample.Gender = *req.Gender
	}
	if req.Age != nil {
		sample.Age = *req.Age
	}
	if req.SampleType != nil {
		sample.SampleType = model.SampleType(*req.SampleType)
	}
	if req.NucleicAcidType != nil {
		sample.NucleicAcidType = model.NucleicAcidType(*req.NucleicAcidType)
	}
	if req.TumorType != nil {
		sample.TumorType = *req.TumorType
	}
	if req.Status != nil {
		sample.Status = model.SomaticSampleStatus(*req.Status)
	}
	if req.Hospital != nil {
		sample.Hospital = *req.Hospital
	}
	if req.TestItems != nil {
		sample.TestItems = *req.TestItems
	}
	if req.ExtraInfo != nil {
		sample.ExtraInfo = *req.ExtraInfo
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

// SetPairedSample sets the paired sample for a tumor sample
func (s *SampleService) SetPairedSample(ctx context.Context, sampleID, pairedSampleID string) error {
	id, err := uuid.Parse(sampleID)
	if err != nil {
		return errors.NewValidationError("Invalid sample ID")
	}

	pairedID, err := uuid.Parse(pairedSampleID)
	if err != nil {
		return errors.NewValidationError("Invalid paired sample ID")
	}

	sample, err := s.sampleRepo.GetByID(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.NewNotFoundError("Sample")
		}
		return errors.WrapDatabaseError(err)
	}

	sample.PairedSampleID = &pairedID
	sample.Status = model.SomaticSampleStatusMatched

	if err := s.sampleRepo.Update(ctx, sample); err != nil {
		return errors.WrapDatabaseError(err)
	}

	return nil
}

// GetSamplesByStatus retrieves samples by status
func (s *SampleService) GetSamplesByStatus(ctx context.Context, status model.SomaticSampleStatus) ([]dto.SampleResponse, error) {
	// This is a simplified version - in production, add a repository method
	samples, _, err := s.sampleRepo.GetAll(ctx, &dto.SampleQueryParams{})
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	var filtered []dto.SampleResponse
	for _, sample := range samples {
		if sample.Status == status {
			filtered = append(filtered, *s.toSampleResponse(&sample))
		}
	}

	return filtered, nil
}

// GetSampleDataFiles retrieves all data files for a sample
func (s *SampleService) GetSampleDataFiles(ctx context.Context, sampleID string) ([]dto.DataFileResponse, error) {
	id, err := uuid.Parse(sampleID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid sample ID")
	}

	files, err := s.dataFileRepo.GetBySampleID(ctx, id)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.DataFileResponse, len(files))
	for i, file := range files {
		items[i] = *s.toDataFileResponse(&file)
	}

	return items, nil
}

// toSampleResponse converts a sample model to a response DTO
func (s *SampleService) toSampleResponse(sample *model.Sample) *dto.SampleResponse {
	var pairedSampleID *string
	if sample.PairedSampleID != nil {
		id := sample.PairedSampleID.String()
		pairedSampleID = &id
	}

	var birthDate *time.Time
	if sample.BirthDate != nil {
		birthDate = sample.BirthDate
	}

	return &dto.SampleResponse{
		ID:              sample.ID.String(),
		InternalID:      sample.InternalID,
		Name:            sample.Name,
		Gender:          sample.Gender,
		Age:             sample.Age,
		BirthDate:       birthDate,
		SampleType:      string(sample.SampleType),
		NucleicAcidType: string(sample.NucleicAcidType),
		TumorType:       sample.TumorType,
		PairedSampleID:  pairedSampleID,
		Status:          string(sample.Status),
		Hospital:        sample.Hospital,
		TestItems:       sample.TestItems,
		DataCount:       sample.DataCount,
		ExtraInfo:       sample.ExtraInfo,
		CreatedAt:       sample.CreatedAt,
		UpdatedAt:       sample.UpdatedAt,
	}
}

// toPaginatedResponse creates a paginated response
func (s *SampleService) toPaginatedResponse(items []dto.SampleResponse, total int64, params *dto.SampleQueryParams) *dto.SampleListResponse {
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
	}
}

// toDataFileResponse converts a data file model to a response DTO
func (s *SampleService) toDataFileResponse(file *model.DataFile) *dto.DataFileResponse {
	var sampleID, runID *string
	if file.SampleID != nil {
		id := file.SampleID.String()
		sampleID = &id
	}
	if file.RunID != nil {
		id := file.RunID.String()
		runID = &id
	}

	return &dto.DataFileResponse{
		ID:         file.ID.String(),
		SampleID:   sampleID,
		RunID:      runID,
		Lane:       file.Lane,
		FileName:   file.FileName,
		FilePath:   file.FilePath,
		FileSize:   file.FileSize,
		FileType:   string(file.FileType),
		ReadType:   string(file.ReadType),
		MD5Hash:    file.MD5Hash,
		Status:     string(file.Status),
		CreatedAt:  file.CreatedAt,
	}
}
