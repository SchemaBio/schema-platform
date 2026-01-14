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

// SampleSheetService handles sample sheet operations
type SampleSheetService struct {
	sampleSheetRepo *repository.SampleSheetRepository
	sampleIndexRepo *repository.SampleIndexRepository
}

// NewSampleSheetService creates a new sample sheet service
func NewSampleSheetService(
	sampleSheetRepo *repository.SampleSheetRepository,
	sampleIndexRepo *repository.SampleIndexRepository,
) *SampleSheetService {
	return &SampleSheetService{
		sampleSheetRepo: sampleSheetRepo,
		sampleIndexRepo: sampleIndexRepo,
	}
}

// CreateSampleSheet creates a new sample sheet
func (s *SampleSheetService) CreateSampleSheet(ctx context.Context, req *dto.SampleSheetRequest, uploadedBy string) (*dto.SampleSheetResponse, error) {
	uploadedByUUID, err := uuid.Parse(uploadedBy)
	if err != nil {
		return nil, errors.NewValidationError("Invalid uploaded by ID")
	}

	var runID, sequencerID *uuid.UUID
	if req.RunID != "" {
		id, err := uuid.Parse(req.RunID)
		if err != nil {
			return nil, errors.NewValidationError("Invalid run ID")
		}
		runID = &id
	}
	if req.SequencerID != "" {
		id, err := uuid.Parse(req.SequencerID)
		if err != nil {
			return nil, errors.NewValidationError("Invalid sequencer ID")
		}
		sequencerID = &id
	}

	sheet := &model.SampleSheet{
		FileName:    req.FileName,
		RunID:       runID,
		SequencerID: sequencerID,
		Status:      model.SampleSheetStatusProcessing,
		UploadedBy:  &uploadedByUUID,
	}

	if err := s.sampleSheetRepo.Create(ctx, sheet); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toSampleSheetResponse(sheet), nil
}

// GetSampleSheet retrieves a sample sheet by ID
func (s *SampleSheetService) GetSampleSheet(ctx context.Context, id string) (*dto.SampleSheetResponse, error) {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.NewValidationError("Invalid sample sheet ID")
	}

	sheet, err := s.sampleSheetRepo.GetByID(ctx, uuid)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("SampleSheet")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toSampleSheetResponse(sheet), nil
}

// GetSampleSheets retrieves all sample sheets with pagination
func (s *SampleSheetService) GetSampleSheets(ctx context.Context, params *dto.PaginatedRequest) (*dto.SampleSheetListResponse, error) {
	sheets, total, err := s.sampleSheetRepo.GetAll(ctx, params)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.SampleSheetResponse, len(sheets))
	for i, sheet := range sheets {
		items[i] = *s.toSampleSheetResponse(&sheet)
	}

	page := params.GetPage()
	pageSize := params.GetPageSize()
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &dto.SampleSheetListResponse{
		Items:      items,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// UpdateSampleSheetStatus updates a sample sheet's status
func (s *SampleSheetService) UpdateSampleSheetStatus(ctx context.Context, id string, status model.SampleSheetStatus) error {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return errors.NewValidationError("Invalid sample sheet ID")
	}

	return s.sampleSheetRepo.UpdateStatus(ctx, uuid, status)
}

// GetSampleSheetIndices retrieves all indices for a sample sheet
func (s *SampleSheetService) GetSampleSheetIndices(ctx context.Context, sheetID string) ([]dto.SampleIndexResponse, error) {
	uuid, err := uuid.Parse(sheetID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid sample sheet ID")
	}

	indices, err := s.sampleIndexRepo.GetBySampleSheetID(ctx, uuid)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.SampleIndexResponse, len(indices))
	for i, index := range indices {
		items[i] = *s.toSampleIndexResponse(&index)
	}

	return items, nil
}

// toSampleSheetResponse converts a sample sheet model to a response DTO
func (s *SampleSheetService) toSampleSheetResponse(sheet *model.SampleSheet) *dto.SampleSheetResponse {
	var runID, sequencerID, uploadedBy *string
	if sheet.RunID != nil {
		id := sheet.RunID.String()
		runID = &id
	}
	if sheet.SequencerID != nil {
		id := sheet.SequencerID.String()
		sequencerID = &id
	}
	if sheet.UploadedBy != nil {
		id := sheet.UploadedBy.String()
		uploadedBy = &id
	}

	return &dto.SampleSheetResponse{
		ID:             sheet.ID.String(),
		FileName:       sheet.FileName,
		RunID:          runID,
		SequencerID:    sequencerID,
		SampleCount:    sheet.SampleCount,
		MatchedCount:   sheet.MatchedCount,
		UnmatchedCount: sheet.UnmatchedCount,
		Status:         string(sheet.Status),
		UploadedBy:     uploadedBy,
		UploadedAt:     sheet.UploadedAt,
		CreatedAt:      sheet.CreatedAt,
		UpdatedAt:      sheet.UpdatedAt,
	}
}

// toSampleIndexResponse converts a sample index model to a response DTO
func (s *SampleSheetService) toSampleIndexResponse(index *model.SampleIndex) *dto.SampleIndexResponse {
	var sampleID *string
	if index.SampleID != nil {
		id := index.SampleID.String()
		sampleID = &id
	}

	return &dto.SampleIndexResponse{
		ID:            index.ID.String(),
		SampleSheetID: index.SampleSheetID.String(),
		SampleID:      sampleID,
		Lane:          index.Lane,
		Index5:        index.Index5,
		Index7:        index.Index7,
		ProjectName:   index.ProjectName,
		Description:   index.Description,
		Matched:       index.Matched,
		CreatedAt:     index.CreatedAt,
	}
}

