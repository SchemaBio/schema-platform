package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/middleware"
	"github.com/schema-platform/backend-api/internal/pkg/response"
	"github.com/schema-platform/backend-api/internal/service"
)

// BatchHandler handles batch endpoints
type BatchHandler struct {
	batchService *service.BatchService
}

// NewBatchHandler creates a new batch handler
func NewBatchHandler(batchService *service.BatchService) *BatchHandler {
	return &BatchHandler{batchService: batchService}
}

// GetBatches handles listing batches
func (h *BatchHandler) GetBatches(c *gin.Context) {
	var params dto.BatchQueryParams
	if err := c.ShouldBindQuery(&params); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.batchService.GetBatches(c.Request.Context(), &params)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// CreateBatch handles creating a batch
func (h *BatchHandler) CreateBatch(c *gin.Context) {
	var req dto.BatchCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	userID := middleware.GetUserID(c)
	result, err := h.batchService.CreateBatch(c.Request.Context(), &req, userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, result)
}

// GetBatch handles getting a batch by ID
func (h *BatchHandler) GetBatch(c *gin.Context) {
	batchID := c.Param("id")

	result, err := h.batchService.GetBatch(c.Request.Context(), batchID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// UpdateBatch handles updating a batch
func (h *BatchHandler) UpdateBatch(c *gin.Context) {
	batchID := c.Param("id")

	var req dto.BatchUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.batchService.UpdateBatch(c.Request.Context(), batchID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// DeleteBatch handles deleting a batch
func (h *BatchHandler) DeleteBatch(c *gin.Context) {
	batchID := c.Param("id")

	if err := h.batchService.DeleteBatch(c.Request.Context(), batchID); err != nil {
		response.Error(c, err)
		return
	}

	response.NoContent(c)
}

// AddSamples handles adding samples to a batch
func (h *BatchHandler) AddSamples(c *gin.Context) {
	batchID := c.Param("id")

	var req dto.BatchAddSamplesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	if err := h.batchService.AddSamples(c.Request.Context(), batchID, &req); err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, map[string]string{"message": "Samples added successfully"})
}

// GetBatchSamples handles getting samples in a batch
func (h *BatchHandler) GetBatchSamples(c *gin.Context) {
	batchID := c.Param("id")

	result, err := h.batchService.GetBatchWithSamples(c.Request.Context(), batchID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result.Samples)
}

// RegisterRoutes registers batch routes
func (h *BatchHandler) RegisterRoutes(r *gin.RouterGroup) {
	r.GET("", h.GetBatches)
	r.POST("", h.CreateBatch)
	r.GET("/:id", h.GetBatch)
	r.PUT("/:id", h.UpdateBatch)
	r.DELETE("/:id", h.DeleteBatch)
	r.GET("/:id/samples", h.GetBatchSamples)
	r.POST("/:id/samples", h.AddSamples)
}
