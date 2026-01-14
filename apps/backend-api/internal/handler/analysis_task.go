package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/middleware"
	"github.com/schema-platform/backend-api/internal/pkg/response"
	"github.com/schema-platform/backend-api/internal/service"
)

// AnalysisTaskHandler handles analysis task endpoints
type AnalysisTaskHandler struct {
	analysisTaskService *service.AnalysisTaskService
}

// NewAnalysisTaskHandler creates a new analysis task handler
func NewAnalysisTaskHandler(analysisTaskService *service.AnalysisTaskService) *AnalysisTaskHandler {
	return &AnalysisTaskHandler{analysisTaskService: analysisTaskService}
}

// GetAnalysisTasks handles listing analysis tasks
func (h *AnalysisTaskHandler) GetAnalysisTasks(c *gin.Context) {
	var params dto.AnalysisTaskQueryParams
	if err := c.ShouldBindQuery(&params); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.analysisTaskService.GetAnalysisTasks(c.Request.Context(), &params)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// CreateAnalysisTask handles creating an analysis task
func (h *AnalysisTaskHandler) CreateAnalysisTask(c *gin.Context) {
	var req dto.AnalysisTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	userID := middleware.GetUserID(c)
	result, err := h.analysisTaskService.CreateAnalysisTask(c.Request.Context(), &req, userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, result)
}

// GetAnalysisTask handles getting an analysis task by ID
func (h *AnalysisTaskHandler) GetAnalysisTask(c *gin.Context) {
	taskID := c.Param("id")

	result, err := h.analysisTaskService.GetAnalysisTask(c.Request.Context(), taskID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// GetAnalysisTaskResultFiles handles getting result files for an analysis task
func (h *AnalysisTaskHandler) GetAnalysisTaskResultFiles(c *gin.Context) {
	taskID := c.Param("id")

	result, err := h.analysisTaskService.GetAnalysisTaskResultFiles(c.Request.Context(), taskID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// RegisterRoutes registers analysis task routes
func (h *AnalysisTaskHandler) RegisterRoutes(r *gin.RouterGroup) {
	r.GET("", h.GetAnalysisTasks)
	r.POST("", h.CreateAnalysisTask)
	r.GET("/:id", h.GetAnalysisTask)
	r.GET("/:id/results", h.GetAnalysisTaskResultFiles)
}

// PipelineHandler handles pipeline endpoints
type PipelineHandler struct {
	pipelineService *service.PipelineService
}

// NewPipelineHandler creates a new pipeline handler
func NewPipelineHandler(pipelineService *service.PipelineService) *PipelineHandler {
	return &PipelineHandler{pipelineService: pipelineService}
}

// GetPipelines handles listing pipelines
func (h *PipelineHandler) GetPipelines(c *gin.Context) {
	var params dto.PaginatedRequest
	if err := c.ShouldBindQuery(&params); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.pipelineService.GetPipelines(c.Request.Context(), &params)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// CreatePipeline handles creating a pipeline
func (h *PipelineHandler) CreatePipeline(c *gin.Context) {
	var req dto.PipelineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.pipelineService.CreatePipeline(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, result)
}

// GetPipeline handles getting a pipeline by ID
func (h *PipelineHandler) GetPipeline(c *gin.Context) {
	pipelineID := c.Param("id")

	result, err := h.pipelineService.GetPipeline(c.Request.Context(), pipelineID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// GetActivePipelines handles getting all active pipelines
func (h *PipelineHandler) GetActivePipelines(c *gin.Context) {
	result, err := h.pipelineService.GetActivePipelines(c.Request.Context())
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// UpdatePipeline handles updating a pipeline
func (h *PipelineHandler) UpdatePipeline(c *gin.Context) {
	pipelineID := c.Param("id")

	var req dto.PipelineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.pipelineService.UpdatePipeline(c.Request.Context(), pipelineID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// DeletePipeline handles deleting a pipeline
func (h *PipelineHandler) DeletePipeline(c *gin.Context) {
	pipelineID := c.Param("id")

	if err := h.pipelineService.DeletePipeline(c.Request.Context(), pipelineID); err != nil {
		response.Error(c, err)
		return
	}

	response.NoContent(c)
}

// RegisterRoutes registers pipeline routes
func (h *PipelineHandler) RegisterRoutes(r *gin.RouterGroup) {
	r.GET("", h.GetPipelines)
	r.GET("/active", h.GetActivePipelines)
	r.POST("", h.CreatePipeline)
	r.GET("/:id", h.GetPipeline)
	r.PUT("/:id", h.UpdatePipeline)
	r.DELETE("/:id", h.DeletePipeline)
}

// ResultFileHandler handles result file endpoints
type ResultFileHandler struct {
	resultFileService *service.ResultFileService
}

// NewResultFileHandler creates a new result file handler
func NewResultFileHandler(resultFileService *service.ResultFileService) *ResultFileHandler {
	return &ResultFileHandler{resultFileService: resultFileService}
}

// GetResultFiles handles getting result files for a task
func (h *ResultFileHandler) GetResultFiles(c *gin.Context) {
	taskID := c.Param("taskId")

	result, err := h.resultFileService.GetResultFiles(c.Request.Context(), taskID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// RegisterRoutes registers result file routes
func (h *ResultFileHandler) RegisterRoutes(r *gin.RouterGroup) {
	r.GET("/:taskId/results", h.GetResultFiles)
}

// StorageSourceHandler handles storage source endpoints
type StorageSourceHandler struct {
	storageSourceService *service.StorageSourceService
}

// NewStorageSourceHandler creates a new storage source handler
func NewStorageSourceHandler(storageSourceService *service.StorageSourceService) *StorageSourceHandler {
	return &StorageSourceHandler{storageSourceService: storageSourceService}
}

// GetStorageSources handles listing storage sources
func (h *StorageSourceHandler) GetStorageSources(c *gin.Context) {
	var params dto.PaginatedRequest
	if err := c.ShouldBindQuery(&params); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.storageSourceService.GetStorageSources(c.Request.Context(), &params)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// CreateStorageSource handles creating a storage source
func (h *StorageSourceHandler) CreateStorageSource(c *gin.Context) {
	var req dto.StorageSourceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.storageSourceService.CreateStorageSource(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, result)
}

// GetStorageSource handles getting a storage source by ID
func (h *StorageSourceHandler) GetStorageSource(c *gin.Context) {
	sourceID := c.Param("id")

	result, err := h.storageSourceService.GetStorageSource(c.Request.Context(), sourceID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// GetDefaultStorageSource handles getting the default storage source
func (h *StorageSourceHandler) GetDefaultStorageSource(c *gin.Context) {
	result, err := h.storageSourceService.GetDefaultStorageSource(c.Request.Context())
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// UpdateStorageSource handles updating a storage source
func (h *StorageSourceHandler) UpdateStorageSource(c *gin.Context) {
	sourceID := c.Param("id")

	var req dto.StorageSourceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.storageSourceService.UpdateStorageSource(c.Request.Context(), sourceID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// DeleteStorageSource handles deleting a storage source
func (h *StorageSourceHandler) DeleteStorageSource(c *gin.Context) {
	sourceID := c.Param("id")

	if err := h.storageSourceService.DeleteStorageSource(c.Request.Context(), sourceID); err != nil {
		response.Error(c, err)
		return
	}

	response.NoContent(c)
}

// RegisterRoutes registers storage source routes
func (h *StorageSourceHandler) RegisterRoutes(r *gin.RouterGroup) {
	r.GET("", h.GetStorageSources)
	r.GET("/default", h.GetDefaultStorageSource)
	r.POST("", h.CreateStorageSource)
	r.GET("/:id", h.GetStorageSource)
	r.PUT("/:id", h.UpdateStorageSource)
	r.DELETE("/:id", h.DeleteStorageSource)
}
