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

// PipelineService handles pipeline operations
type PipelineService struct {
	pipelineRepo *repository.PipelineRepository
}

// NewPipelineService creates a new pipeline service
func NewPipelineService(pipelineRepo *repository.PipelineRepository) *PipelineService {
	return &PipelineService{pipelineRepo: pipelineRepo}
}

// CreatePipeline creates a new pipeline
func (s *PipelineService) CreatePipeline(ctx context.Context, req *dto.PipelineRequest) (*dto.PipelineResponse, error) {
	status := model.PipelineStatusActive
	if req.Status != "" {
		status = model.PipelineStatus(req.Status)
	}

	pipeline := &model.Pipeline{
		Name:            req.Name,
		BasePipeline:    model.BasePipelineType(req.BasePipeline),
		Version:         req.Version,
		Description:     req.Description,
		BEDFile:         req.BEDFile,
		ReferenceGenome: model.ReferenceGenome(req.ReferenceGenome),
		CNVBaseline:     req.CNVBaseline,
		MSIBaseline:     req.MSIBaseline,
		Status:          status,
	}

	if err := s.pipelineRepo.Create(ctx, pipeline); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toPipelineResponse(pipeline), nil
}

// GetPipeline retrieves a pipeline by ID
func (s *PipelineService) GetPipeline(ctx context.Context, id string) (*dto.PipelineResponse, error) {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.NewValidationError("Invalid pipeline ID")
	}

	pipeline, err := s.pipelineRepo.GetByID(ctx, uuid)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("Pipeline")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toPipelineResponse(pipeline), nil
}

// GetPipelines retrieves all pipelines with pagination
func (s *PipelineService) GetPipelines(ctx context.Context, params *dto.PaginatedRequest) (*dto.PipelineListResponse, error) {
	pipelines, total, err := s.pipelineRepo.GetAll(ctx, params)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.PipelineResponse, len(pipelines))
	for i, pipeline := range pipelines {
		items[i] = *s.toPipelineResponse(&pipeline)
	}

	return toPipelinePaginatedResponse(items, total, params), nil
}

// GetActivePipelines retrieves all active pipelines
func (s *PipelineService) GetActivePipelines(ctx context.Context) ([]dto.PipelineResponse, error) {
	pipelines, err := s.pipelineRepo.GetActive(ctx)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.PipelineResponse, len(pipelines))
	for i, pipeline := range pipelines {
		items[i] = *s.toPipelineResponse(&pipeline)
	}

	return items, nil
}

// UpdatePipeline updates a pipeline
func (s *PipelineService) UpdatePipeline(ctx context.Context, id string, req *dto.PipelineRequest) (*dto.PipelineResponse, error) {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.NewValidationError("Invalid pipeline ID")
	}

	pipeline, err := s.pipelineRepo.GetByID(ctx, uuid)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("Pipeline")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	if req.Name != "" {
		pipeline.Name = req.Name
	}
	if req.BasePipeline != "" {
		pipeline.BasePipeline = model.BasePipelineType(req.BasePipeline)
	}
	if req.Version != "" {
		pipeline.Version = req.Version
	}
	if req.Description != "" {
		pipeline.Description = req.Description
	}
	if req.BEDFile != "" {
		pipeline.BEDFile = req.BEDFile
	}
	if req.ReferenceGenome != "" {
		pipeline.ReferenceGenome = model.ReferenceGenome(req.ReferenceGenome)
	}
	if req.CNVBaseline != "" {
		pipeline.CNVBaseline = req.CNVBaseline
	}
	if req.MSIBaseline != "" {
		pipeline.MSIBaseline = req.MSIBaseline
	}
	if req.Status != "" {
		pipeline.Status = model.PipelineStatus(req.Status)
	}

	if err := s.pipelineRepo.Update(ctx, pipeline); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toPipelineResponse(pipeline), nil
}

// DeletePipeline deletes a pipeline
func (s *PipelineService) DeletePipeline(ctx context.Context, id string) error {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return errors.NewValidationError("Invalid pipeline ID")
	}

	exists, err := s.pipelineRepo.Exists(ctx, uuid)
	if err != nil {
		return errors.WrapDatabaseError(err)
	}
	if !exists {
		return errors.NewNotFoundError("Pipeline")
	}

	if err := s.pipelineRepo.Delete(ctx, uuid); err != nil {
		return errors.WrapDatabaseError(err)
	}

	return nil
}

// toPipelineResponse converts a pipeline model to a response DTO
func (s *PipelineService) toPipelineResponse(pipeline *model.Pipeline) *dto.PipelineResponse {
	return &dto.PipelineResponse{
		ID:              pipeline.ID.String(),
		Name:            pipeline.Name,
		BasePipeline:    string(pipeline.BasePipeline),
		Version:         pipeline.Version,
		Description:     pipeline.Description,
		BEDFile:         pipeline.BEDFile,
		ReferenceGenome: string(pipeline.ReferenceGenome),
		CNVBaseline:     pipeline.CNVBaseline,
		MSIBaseline:     pipeline.MSIBaseline,
		Status:          string(pipeline.Status),
		CreatedAt:       pipeline.CreatedAt,
		UpdatedAt:       pipeline.UpdatedAt,
	}
}

// toPipelinePaginatedResponse creates a paginated response for pipelines
func toPipelinePaginatedResponse(items []dto.PipelineResponse, total int64, params *dto.PaginatedRequest) *dto.PipelineListResponse {
	page := params.GetPage()
	pageSize := params.GetPageSize()
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &dto.PipelineListResponse{
		Items:      items,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}
