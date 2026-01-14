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

// SequencerService handles sequencer operations
type SequencerService struct {
	sequencerRepo *repository.SequencerRepository
}

// NewSequencerService creates a new sequencer service
func NewSequencerService(sequencerRepo *repository.SequencerRepository) *SequencerService {
	return &SequencerService{sequencerRepo: sequencerRepo}
}

// CreateSequencer creates a new sequencer
func (s *SequencerService) CreateSequencer(ctx context.Context, req *dto.SequencerRequest) (*dto.SequencerResponse, error) {
	status := model.SequencerStatusOffline
	if req.Status != "" {
		status = model.SequencerStatus(req.Status)
	}

	sequencer := &model.Sequencer{
		Name:         req.Name,
		SerialNumber: req.SerialNumber,
		Platform:     model.SequencerPlatform(req.Platform),
		Model:        req.Model,
		DataPath:     req.DataPath,
		Status:       status,
	}

	if err := s.sequencerRepo.Create(ctx, sequencer); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toSequencerResponse(sequencer), nil
}

// GetSequencer retrieves a sequencer by ID
func (s *SequencerService) GetSequencer(ctx context.Context, id string) (*dto.SequencerResponse, error) {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.NewValidationError("Invalid sequencer ID")
	}

	sequencer, err := s.sequencerRepo.GetByID(ctx, uuid)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("Sequencer")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toSequencerResponse(sequencer), nil
}

// GetSequencers retrieves all sequencers with pagination
func (s *SequencerService) GetSequencers(ctx context.Context, params *dto.PaginatedRequest) (*dto.SequencerListResponse, error) {
	sequencers, total, err := s.sequencerRepo.GetAll(ctx, params)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.SequencerResponse, len(sequencers))
	for i, sequencer := range sequencers {
		items[i] = *s.toSequencerResponse(&sequencer)
	}

	page := params.GetPage()
	pageSize := params.GetPageSize()
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &dto.SequencerListResponse{
		Items:      items,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// UpdateSequencer updates a sequencer
func (s *SequencerService) UpdateSequencer(ctx context.Context, id string, req *dto.SequencerRequest) (*dto.SequencerResponse, error) {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.NewValidationError("Invalid sequencer ID")
	}

	sequencer, err := s.sequencerRepo.GetByID(ctx, uuid)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("Sequencer")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	if req.Name != "" {
		sequencer.Name = req.Name
	}
	if req.SerialNumber != "" {
		sequencer.SerialNumber = req.SerialNumber
	}
	if req.Platform != "" {
		sequencer.Platform = model.SequencerPlatform(req.Platform)
	}
	if req.Model != "" {
		sequencer.Model = req.Model
	}
	if req.DataPath != "" {
		sequencer.DataPath = req.DataPath
	}
	if req.Status != "" {
		sequencer.Status = model.SequencerStatus(req.Status)
	}

	if err := s.sequencerRepo.Update(ctx, sequencer); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toSequencerResponse(sequencer), nil
}

// DeleteSequencer deletes a sequencer
func (s *SequencerService) DeleteSequencer(ctx context.Context, id string) error {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return errors.NewValidationError("Invalid sequencer ID")
	}

	exists, err := s.sequencerRepo.Exists(ctx, uuid)
	if err != nil {
		return errors.WrapDatabaseError(err)
	}
	if !exists {
		return errors.NewNotFoundError("Sequencer")
	}

	if err := s.sequencerRepo.Delete(ctx, uuid); err != nil {
		return errors.WrapDatabaseError(err)
	}

	return nil
}

// toSequencerResponse converts a sequencer model to a response DTO
func (s *SequencerService) toSequencerResponse(sequencer *model.Sequencer) *dto.SequencerResponse {
	return &dto.SequencerResponse{
		ID:           sequencer.ID.String(),
		Name:         sequencer.Name,
		SerialNumber: sequencer.SerialNumber,
		Platform:     string(sequencer.Platform),
		Model:        sequencer.Model,
		DataPath:     sequencer.DataPath,
		Status:       string(sequencer.Status),
		LastSyncAt:   sequencer.LastSyncAt,
		CreatedAt:    sequencer.CreatedAt,
		UpdatedAt:    sequencer.UpdatedAt,
	}
}
