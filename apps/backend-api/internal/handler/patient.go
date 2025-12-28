package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/middleware"
	"github.com/schema-platform/backend-api/internal/pkg/response"
	"github.com/schema-platform/backend-api/internal/service"
)

// PatientHandler handles patient endpoints
type PatientHandler struct {
	patientService *service.PatientService
}

// NewPatientHandler creates a new patient handler
func NewPatientHandler(patientService *service.PatientService) *PatientHandler {
	return &PatientHandler{patientService: patientService}
}

// GetPatients handles listing patients
func (h *PatientHandler) GetPatients(c *gin.Context) {
	var params dto.PatientQueryParams
	if err := c.ShouldBindQuery(&params); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.patientService.GetPatients(c.Request.Context(), &params)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// CreatePatient handles creating a patient
func (h *PatientHandler) CreatePatient(c *gin.Context) {
	var req dto.PatientCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	userID := middleware.GetUserID(c)
	result, err := h.patientService.CreatePatient(c.Request.Context(), &req, userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, result)
}

// GetPatient handles getting a patient by ID
func (h *PatientHandler) GetPatient(c *gin.Context) {
	patientID := c.Param("id")

	result, err := h.patientService.GetPatient(c.Request.Context(), patientID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// UpdatePatient handles updating a patient
func (h *PatientHandler) UpdatePatient(c *gin.Context) {
	patientID := c.Param("id")

	var req dto.PatientUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.patientService.UpdatePatient(c.Request.Context(), patientID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// DeletePatient handles deleting a patient
func (h *PatientHandler) DeletePatient(c *gin.Context) {
	patientID := c.Param("id")

	if err := h.patientService.DeletePatient(c.Request.Context(), patientID); err != nil {
		response.Error(c, err)
		return
	}

	response.NoContent(c)
}

// GetPatientSamples handles getting samples for a patient
func (h *PatientHandler) GetPatientSamples(c *gin.Context) {
	patientID := c.Param("id")

	result, err := h.patientService.GetPatientWithSamples(c.Request.Context(), patientID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result.Samples)
}

// RegisterRoutes registers patient routes
func (h *PatientHandler) RegisterRoutes(r *gin.RouterGroup) {
	r.GET("", h.GetPatients)
	r.POST("", h.CreatePatient)
	r.GET("/:id", h.GetPatient)
	r.PUT("/:id", h.UpdatePatient)
	r.DELETE("/:id", h.DeletePatient)
	r.GET("/:id/samples", h.GetPatientSamples)
}
