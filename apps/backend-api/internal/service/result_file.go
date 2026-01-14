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

// ResultFileService handles result file operations
type ResultFileService struct {
	resultFileRepo *repository.ResultFileRepository
}

// NewResultFileService creates a new result file service
func NewResultFileService(resultFileRepo *repository.ResultFileRepository) *ResultFileService {
	return &ResultFileService{resultFileRepo: resultFileRepo}
}

// GetResultFiles retrieves result files by task ID
func (s *ResultFileService) GetResultFiles(ctx context.Context, taskID string) ([]dto.ResultFileResponse, error) {
	uuid, err := uuid.Parse(taskID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid task ID")
	}

	files, err := s.resultFileRepo.GetByTaskID(ctx, uuid)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.ResultFileResponse, len(files))
	for i, file := range files {
		items[i] = *s.toResultFileResponse(&file)
	}

	return items, nil
}

// GetResultFilesByType retrieves result files by type
func (s *ResultFileService) GetResultFilesByType(ctx context.Context, taskID string, resultType model.ResultType) ([]dto.ResultFileResponse, error) {
	uuid, err := uuid.Parse(taskID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid task ID")
	}

	files, err := s.resultFileRepo.GetByType(ctx, uuid, resultType)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.ResultFileResponse, len(files))
	for i, file := range files {
		items[i] = *s.toResultFileResponse(&file)
	}

	return items, nil
}

// toResultFileResponse converts a result file model to a response DTO
func (s *ResultFileService) toResultFileResponse(file *model.ResultFile) *dto.ResultFileResponse {
	return &dto.ResultFileResponse{
		ID:          file.ID.String(),
		TaskID:      file.TaskID.String(),
		ResultType:  string(file.ResultType),
		FilePath:    file.FilePath,
		FileSize:    file.FileSize,
		RecordCount: file.RecordCount,
		CreatedAt:   file.CreatedAt,
	}
}
