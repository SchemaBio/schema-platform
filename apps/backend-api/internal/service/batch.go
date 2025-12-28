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

// BatchService handles batch operations
type BatchService struct {
	batchRepo  *repository.BatchRepository
	sampleRepo *repository.SampleRepository
}

// NewBatchService creates a new batch service
func NewBatchService(batchRepo *repository.BatchRepository, sampleRepo *repository.SampleRepository) *BatchService {
	return &BatchService{
		batchRepo:  batchRepo,
		sampleRepo: sampleRepo,
	}
}

// CreateBatch creates a new batch
func (s *BatchService) CreateBatch(ctx context.Context, req *dto.BatchCreateRequest, createdBy string) (*dto.BatchResponse, error) {
	creatorID, err := uuid.Parse(createdBy)
	if err != nil {
		return nil, errors.NewValidationError("Invalid creator ID")
	}

	batch := &model.Batch{
		Name:      req.Name,
		Status:    model.SampleStatusPending,
		CreatedBy: creatorID,
	}

	if err := s.batchRepo.Create(ctx, batch); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	// Add samples if provided
	if len(req.SampleIDs) > 0 {
		sampleIDs := make([]uuid.UUID, len(req.SampleIDs))
		for i, id := range req.SampleIDs {
			sampleID, err := uuid.Parse(id)
			if err != nil {
				return nil, errors.NewValidationError("Invalid sample ID")
			}
			sampleIDs[i] = sampleID
		}
		if err := s.batchRepo.AddSamples(ctx, batch.ID, sampleIDs); err != nil {
			return nil, errors.WrapDatabaseError(err)
		}
	}

	return s.toBatchResponse(batch), nil
}

// GetBatch retrieves a batch by ID
func (s *BatchService) GetBatch(ctx context.Context, batchID string) (*dto.BatchResponse, error) {
	id, err := uuid.Parse(batchID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid batch ID")
	}

	batch, err := s.batchRepo.GetByID(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("Batch")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toBatchResponse(batch), nil
}


// GetBatches retrieves all batches with pagination
func (s *BatchService) GetBatches(ctx context.Context, params *dto.BatchQueryParams) (*dto.BatchListResponse, error) {
	batches, total, err := s.batchRepo.GetAll(ctx, params)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.BatchResponse, len(batches))
	for i, batch := range batches {
		items[i] = *s.toBatchResponse(&batch)
	}

	page := params.GetPage()
	pageSize := params.GetPageSize()
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &dto.BatchListResponse{
		Items:      items,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// UpdateBatch updates a batch
func (s *BatchService) UpdateBatch(ctx context.Context, batchID string, req *dto.BatchUpdateRequest) (*dto.BatchResponse, error) {
	id, err := uuid.Parse(batchID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid batch ID")
	}

	batch, err := s.batchRepo.GetByID(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("Batch")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	if req.Name != nil {
		batch.Name = *req.Name
	}
	if req.Status != nil {
		batch.Status = model.SampleStatus(*req.Status)
	}

	if err := s.batchRepo.Update(ctx, batch); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toBatchResponse(batch), nil
}

// DeleteBatch soft deletes a batch
func (s *BatchService) DeleteBatch(ctx context.Context, batchID string) error {
	id, err := uuid.Parse(batchID)
	if err != nil {
		return errors.NewValidationError("Invalid batch ID")
	}

	exists, err := s.batchRepo.Exists(ctx, id)
	if err != nil {
		return errors.WrapDatabaseError(err)
	}
	if !exists {
		return errors.NewNotFoundError("Batch")
	}

	return s.batchRepo.SoftDelete(ctx, id)
}

// AddSamples adds samples to a batch
func (s *BatchService) AddSamples(ctx context.Context, batchID string, req *dto.BatchAddSamplesRequest) error {
	id, err := uuid.Parse(batchID)
	if err != nil {
		return errors.NewValidationError("Invalid batch ID")
	}

	exists, err := s.batchRepo.Exists(ctx, id)
	if err != nil {
		return errors.WrapDatabaseError(err)
	}
	if !exists {
		return errors.NewNotFoundError("Batch")
	}

	sampleIDs := make([]uuid.UUID, len(req.SampleIDs))
	for i, sid := range req.SampleIDs {
		sampleID, err := uuid.Parse(sid)
		if err != nil {
			return errors.NewValidationError("Invalid sample ID")
		}
		sampleIDs[i] = sampleID
	}

	return s.batchRepo.AddSamples(ctx, id, sampleIDs)
}

// GetBatchWithSamples retrieves a batch with its samples
func (s *BatchService) GetBatchWithSamples(ctx context.Context, batchID string) (*dto.BatchWithSamplesResponse, error) {
	id, err := uuid.Parse(batchID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid batch ID")
	}

	batch, err := s.batchRepo.GetWithSamples(ctx, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("Batch")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	samples := make([]dto.SampleResponse, len(batch.Samples))
	for i, sample := range batch.Samples {
		var batchIDStr *string
		if sample.BatchID != nil {
			s := sample.BatchID.String()
			batchIDStr = &s
		}
		samples[i] = dto.SampleResponse{
			ID:         sample.ID.String(),
			Name:       sample.Name,
			PatientID:  sample.PatientID.String(),
			SampleType: string(sample.SampleType),
			Status:     string(sample.Status),
			BatchID:    batchIDStr,
			CreatedBy:  sample.CreatedBy.String(),
			CreatedAt:  sample.CreatedAt,
			UpdatedAt:  sample.UpdatedAt,
		}
	}

	return &dto.BatchWithSamplesResponse{
		BatchResponse: *s.toBatchResponse(batch),
		Samples:       samples,
	}, nil
}

func (s *BatchService) toBatchResponse(batch *model.Batch) *dto.BatchResponse {
	return &dto.BatchResponse{
		ID:          batch.ID.String(),
		Name:        batch.Name,
		Status:      string(batch.Status),
		CreatedBy:   batch.CreatedBy.String(),
		CreatedAt:   batch.CreatedAt,
		UpdatedAt:   batch.UpdatedAt,
		CompletedAt: batch.CompletedAt,
	}
}
