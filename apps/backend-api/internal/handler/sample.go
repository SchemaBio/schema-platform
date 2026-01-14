package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/middleware"
	"github.com/schema-platform/backend-api/internal/pkg/response"
	"github.com/schema-platform/backend-api/internal/service"
)

// SampleHandler handles sample endpoints
type SampleHandler struct {
	sampleService *service.SampleService
}

// NewSampleHandler creates a new sample handler
func NewSampleHandler(sampleService *service.SampleService) *SampleHandler {
	return &SampleHandler{sampleService: sampleService}
}

// GetSamples handles listing samples
func (h *SampleHandler) GetSamples(c *gin.Context) {
	var params dto.SampleQueryParams
	if err := c.ShouldBindQuery(&params); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.sampleService.GetSamples(c.Request.Context(), &params)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// CreateSample handles creating a sample
func (h *SampleHandler) CreateSample(c *gin.Context) {
	var req dto.CreateSampleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	userID := middleware.GetUserID(c)
	result, err := h.sampleService.CreateSample(c.Request.Context(), &req, userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, result)
}

// GetSample handles getting a sample by ID
func (h *SampleHandler) GetSample(c *gin.Context) {
	sampleID := c.Param("id")

	result, err := h.sampleService.GetSample(c.Request.Context(), sampleID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// UpdateSample handles updating a sample
func (h *SampleHandler) UpdateSample(c *gin.Context) {
	sampleID := c.Param("id")

	var req dto.UpdateSampleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.sampleService.UpdateSample(c.Request.Context(), sampleID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// DeleteSample handles deleting a sample
func (h *SampleHandler) DeleteSample(c *gin.Context) {
	sampleID := c.Param("id")

	if err := h.sampleService.DeleteSample(c.Request.Context(), sampleID); err != nil {
		response.Error(c, err)
		return
	}

	response.NoContent(c)
}

// RegisterRoutes registers sample routes
func (h *SampleHandler) RegisterRoutes(r *gin.RouterGroup) {
	r.GET("", h.GetSamples)
	r.POST("", h.CreateSample)
	r.GET("/:id", h.GetSample)
	r.PUT("/:id", h.UpdateSample)
	r.DELETE("/:id", h.DeleteSample)
}
