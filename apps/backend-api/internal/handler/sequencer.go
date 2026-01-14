package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/middleware"
	"github.com/schema-platform/backend-api/internal/pkg/response"
	"github.com/schema-platform/backend-api/internal/service"
)

// SequencerHandler handles sequencer endpoints
type SequencerHandler struct {
	sequencerService *service.SequencerService
}

// NewSequencerHandler creates a new sequencer handler
func NewSequencerHandler(sequencerService *service.SequencerService) *SequencerHandler {
	return &SequencerHandler{sequencerService: sequencerService}
}

// GetSequencers handles listing sequencers
func (h *SequencerHandler) GetSequencers(c *gin.Context) {
	var params dto.PaginatedRequest
	if err := c.ShouldBindQuery(&params); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.sequencerService.GetSequencers(c.Request.Context(), &params)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// CreateSequencer handles creating a sequencer
func (h *SequencerHandler) CreateSequencer(c *gin.Context) {
	var req dto.SequencerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.sequencerService.CreateSequencer(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, result)
}

// GetSequencer handles getting a sequencer by ID
func (h *SequencerHandler) GetSequencer(c *gin.Context) {
	sequencerID := c.Param("id")

	result, err := h.sequencerService.GetSequencer(c.Request.Context(), sequencerID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// UpdateSequencer handles updating a sequencer
func (h *SequencerHandler) UpdateSequencer(c *gin.Context) {
	sequencerID := c.Param("id")

	var req dto.SequencerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.sequencerService.UpdateSequencer(c.Request.Context(), sequencerID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// DeleteSequencer handles deleting a sequencer
func (h *SequencerHandler) DeleteSequencer(c *gin.Context) {
	sequencerID := c.Param("id")

	if err := h.sequencerService.DeleteSequencer(c.Request.Context(), sequencerID); err != nil {
		response.Error(c, err)
		return
	}

	response.NoContent(c)
}

// RegisterRoutes registers sequencer routes
func (h *SequencerHandler) RegisterRoutes(r *gin.RouterGroup) {
	r.GET("", h.GetSequencers)
	r.POST("", h.CreateSequencer)
	r.GET("/:id", h.GetSequencer)
	r.PUT("/:id", h.UpdateSequencer)
	r.DELETE("/:id", h.DeleteSequencer)
}

// SampleSheetHandler handles sample sheet endpoints
type SampleSheetHandler struct {
	sampleSheetService *service.SampleSheetService
}

// NewSampleSheetHandler creates a new sample sheet handler
func NewSampleSheetHandler(sampleSheetService *service.SampleSheetService) *SampleSheetHandler {
	return &SampleSheetHandler{sampleSheetService: sampleSheetService}
}

// GetSampleSheets handles listing sample sheets
func (h *SampleSheetHandler) GetSampleSheets(c *gin.Context) {
	var params dto.PaginatedRequest
	if err := c.ShouldBindQuery(&params); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.sampleSheetService.GetSampleSheets(c.Request.Context(), &params)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// CreateSampleSheet handles creating a sample sheet
func (h *SampleSheetHandler) CreateSampleSheet(c *gin.Context) {
	var req dto.SampleSheetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	userID := middleware.GetUserID(c)
	result, err := h.sampleSheetService.CreateSampleSheet(c.Request.Context(), &req, userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, result)
}

// GetSampleSheet handles getting a sample sheet by ID
func (h *SampleSheetHandler) GetSampleSheet(c *gin.Context) {
	sheetID := c.Param("id")

	result, err := h.sampleSheetService.GetSampleSheet(c.Request.Context(), sheetID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// GetSampleSheetIndices handles getting indices for a sample sheet
func (h *SampleSheetHandler) GetSampleSheetIndices(c *gin.Context) {
	sheetID := c.Param("id")

	result, err := h.sampleSheetService.GetSampleSheetIndices(c.Request.Context(), sheetID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// RegisterRoutes registers sample sheet routes
func (h *SampleSheetHandler) RegisterRoutes(r *gin.RouterGroup) {
	r.GET("", h.GetSampleSheets)
	r.POST("", h.CreateSampleSheet)
	r.GET("/:id", h.GetSampleSheet)
	r.GET("/:id/indices", h.GetSampleSheetIndices)
}
