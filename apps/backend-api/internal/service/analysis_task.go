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

// AnalysisTaskService handles analysis task operations
type AnalysisTaskService struct {
	taskRepo     *repository.AnalysisTaskRepository
	sampleRepo   *repository.SampleRepository
	pipelineRepo *repository.PipelineRepository
}

// NewAnalysisTaskService creates a new analysis task service
func NewAnalysisTaskService(
	taskRepo *repository.AnalysisTaskRepository,
	sampleRepo *repository.SampleRepository,
	pipelineRepo *repository.PipelineRepository,
) *AnalysisTaskService {
	return &AnalysisTaskService{
		taskRepo:     taskRepo,
		sampleRepo:   sampleRepo,
		pipelineRepo: pipelineRepo,
	}
}

// CreateAnalysisTask creates a new analysis task
func (s *AnalysisTaskService) CreateAnalysisTask(ctx context.Context, req *dto.AnalysisTaskRequest, createdBy string) (*dto.AnalysisTaskResponse, error) {
	creatorID, err := uuid.Parse(createdBy)
	if err != nil {
		return nil, errors.NewValidationError("Invalid creator ID")
	}

	sampleID, err := uuid.Parse(req.SampleID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid sample ID")
	}

	var pipelineID *uuid.UUID
	if req.PipelineID != "" {
		id, err := uuid.Parse(req.PipelineID)
		if err != nil {
			return nil, errors.NewValidationError("Invalid pipeline ID")
		}
		pipelineID = &id
	}

	task := &model.AnalysisTask{
		Name:              req.Name,
		SampleID:          sampleID,
		PipelineID:        pipelineID,
		PipelineVersion:   req.PipelineVersion,
		Status:            model.AnalysisTaskStatusQueued,
		InputDataPath:     req.InputDataPath,
		OutputParquetPath: req.OutputParquetPath,
		CreatedBy:         creatorID,
	}

	if err := s.taskRepo.Create(ctx, task); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toAnalysisTaskResponse(task), nil
}

// GetAnalysisTask retrieves an analysis task by ID
func (s *AnalysisTaskService) GetAnalysisTask(ctx context.Context, id string) (*dto.AnalysisTaskResponse, error) {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.NewValidationError("Invalid task ID")
	}

	task, err := s.taskRepo.GetByID(ctx, uuid)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("AnalysisTask")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toAnalysisTaskResponse(task), nil
}

// GetAnalysisTasks retrieves all analysis tasks with pagination
func (s *AnalysisTaskService) GetAnalysisTasks(ctx context.Context, params *dto.AnalysisTaskQueryParams) (*dto.AnalysisTaskListResponse, error) {
	tasks, total, err := s.taskRepo.GetAll(ctx, params)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.AnalysisTaskResponse, len(tasks))
	for i, task := range tasks {
		items[i] = *s.toAnalysisTaskResponse(&task)
	}

	return toAnalysisTaskPaginatedResponse(items, total, params), nil
}

// UpdateAnalysisTaskStatus updates an analysis task's status
func (s *AnalysisTaskService) UpdateAnalysisTaskStatus(ctx context.Context, id string, status model.AnalysisTaskStatus) error {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return errors.NewValidationError("Invalid task ID")
	}

	return s.taskRepo.UpdateStatus(ctx, uuid, status)
}

// GetAnalysisTaskResultFiles retrieves result files for an analysis task
func (s *AnalysisTaskService) GetAnalysisTaskResultFiles(ctx context.Context, taskID string) ([]dto.ResultFileResponse, error) {
	uuid, err := uuid.Parse(taskID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid task ID")
	}

	resultFileRepo := repository.NewResultFileRepository(s.taskRepo.DB())
	files, err := resultFileRepo.GetByTaskID(ctx, uuid)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.ResultFileResponse, len(files))
	for i, file := range files {
		items[i] = *s.toResultFileResponse(&file)
	}

	return items, nil
}

// toAnalysisTaskResponse converts an analysis task model to a response DTO
func (s *AnalysisTaskService) toAnalysisTaskResponse(task *model.AnalysisTask) *dto.AnalysisTaskResponse {
	var pipelineID *string
	if task.PipelineID != nil {
		id := task.PipelineID.String()
		pipelineID = &id
	}

	return &dto.AnalysisTaskResponse{
		ID:                task.ID.String(),
		Name:              task.Name,
		SampleID:          task.SampleID.String(),
		PipelineID:        pipelineID,
		PipelineVersion:   task.PipelineVersion,
		Status:            string(task.Status),
		InputDataPath:     task.InputDataPath,
		OutputParquetPath: task.OutputParquetPath,
		CreatedBy:         task.CreatedBy.String(),
		CreatedAt:         task.CreatedAt,
		StartedAt:         task.StartedAt,
		CompletedAt:       task.CompletedAt,
		ErrorMessage:      task.ErrorMessage,
	}
}

// toResultFileResponse converts a result file model to a response DTO
func (s *AnalysisTaskService) toResultFileResponse(file *model.ResultFile) *dto.ResultFileResponse {
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

// toAnalysisTaskPaginatedResponse creates a paginated response for analysis tasks
func toAnalysisTaskPaginatedResponse(items []dto.AnalysisTaskResponse, total int64, params *dto.AnalysisTaskQueryParams) *dto.AnalysisTaskListResponse {
	page := params.GetPage()
	pageSize := params.GetPageSize()
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &dto.AnalysisTaskListResponse{
		Items:      items,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}
