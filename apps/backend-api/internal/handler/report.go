package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"schema-platform/apps/backend-api/internal/dto"
	"schema-platform/apps/backend-api/internal/middleware"
	"schema-platform/apps/backend-api/internal/model"
	"schema-platform/apps/backend-api/internal/service"
)

// ReportHandler handles HTTP requests for reports
type ReportHandler struct {
	service *service.ReportService
}

// NewReportHandler creates a new report handler
func NewReportHandler(service *service.ReportService) *ReportHandler {
	return &ReportHandler{service: service}
}

// GetTemplates handles GET /reports/templates
func (h *ReportHandler) GetTemplates(c *gin.Context) {
	orgID := middleware.GetOrgID(c)
	if orgID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "organization ID required"})
		return
	}

	templates, err := h.service.GetTemplates(c.Request.Context(), orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get templates"})
		return
	}

	c.JSON(http.StatusOK, templates)
}

// GetTaskReports handles GET /tasks/:taskId/reports
func (h *ReportHandler) GetTaskReports(c *gin.Context) {
	taskIDStr := c.Param("taskId")
	taskID, err := uuid.Parse(taskIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid task ID"})
		return
	}

	reports, err := h.service.GetTaskReports(c.Request.Context(), taskID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get reports"})
		return
	}

	c.JSON(http.StatusOK, reports)
}

// CreateReport handles POST /tasks/:taskId/reports
func (h *ReportHandler) CreateReport(c *gin.Context) {
	orgID := middleware.GetOrgID(c)
	userID := middleware.GetUserID(c)
	if orgID == uuid.Nil || userID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "organization and user ID required"})
		return
	}

	taskIDStr := c.Param("taskId")
	taskID, err := uuid.Parse(taskIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid task ID"})
		return
	}

	var req dto.CreateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	report, err := h.service.CreateReport(c.Request.Context(), orgID, taskID, userID, req.Title, req.TemplateID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create report"})
		return
	}

	c.JSON(http.StatusCreated, report)
}

// GetReport handles GET /reports/:id
func (h *ReportHandler) GetReport(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report ID"})
		return
	}

	report, err := h.service.GetReport(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "report not found"})
		return
	}

	c.JSON(http.StatusOK, report)
}

// UpdateReportStatus handles PUT /reports/:id/status
func (h *ReportHandler) UpdateReportStatus(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user ID required"})
		return
	}

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report ID"})
		return
	}

	var req dto.UpdateReportStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	status := model.ReportStatus(req.Status)
	if !status.IsValid() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status"})
		return
	}

	err = h.service.UpdateReportStatus(c.Request.Context(), id, status, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "status updated successfully"})
}

// DeleteReport handles DELETE /reports/:id
func (h *ReportHandler) DeleteReport(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report ID"})
		return
	}

	err = h.service.DeleteReport(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "report deleted successfully"})
}

// SubmitForReview handles POST /reports/:id/submit
func (h *ReportHandler) SubmitForReview(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user ID required"})
		return
	}

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report ID"})
		return
	}

	err = h.service.SubmitForReview(c.Request.Context(), id, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "report submitted for review"})
}

// ApproveReport handles POST /reports/:id/approve
func (h *ReportHandler) ApproveReport(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user ID required"})
		return
	}

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report ID"})
		return
	}

	err = h.service.ApproveReport(c.Request.Context(), id, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "report approved"})
}

// RejectReport handles POST /reports/:id/reject
func (h *ReportHandler) RejectReport(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user ID required"})
		return
	}

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report ID"})
		return
	}

	err = h.service.RejectReport(c.Request.Context(), id, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "report rejected"})
}

// ReleaseReport handles POST /reports/:id/release
func (h *ReportHandler) ReleaseReport(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user ID required"})
		return
	}

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report ID"})
		return
	}

	err = h.service.ReleaseReport(c.Request.Context(), id, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "report released"})
}