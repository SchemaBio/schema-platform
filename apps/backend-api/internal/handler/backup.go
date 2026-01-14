package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/config"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/service"
)

// BackupHandler handles database backup and restore operations
type BackupHandler struct {
	backupService *service.BackupService
}

// NewBackupHandler creates a new backup handler
func NewBackupHandler(cfg *config.Config) *BackupHandler {
	return &BackupHandler{
		backupService: service.NewBackupService(cfg),
	}
}

// CreateBackup handles POST /api/backups - create a new backup
// @Summary Create database backup
// @Description Creates a new database backup and stores it locally
// @Tags backups
// @Accept json
// @Produce json
// @Param request body dto.BackupRequest true "Backup options"
// @Success 200 {object} dto.ApiResponse[dto.BackupResponse]
// @Failure 400 {object} dto.ApiResponse[any]
// @Failure 500 {object} dto.ApiResponse[any]
// @Router /api/backups [post]
func (h *BackupHandler) CreateBackup(c *gin.Context) {
	var req dto.BackupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("INVALID_REQUEST", "Invalid request body", nil))
		return
	}

	response, err := h.backupService.Backup(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("BACKUP_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse(*response))
}

// RestoreDatabase handles POST /api/backups/restore - restore from backup
// @Summary Restore database
// @Description Restores the database from a backup file
// @Tags backups
// @Accept json
// @Produce json
// @Param request body dto.RestoreRequest true "Restore options"
// @Success 200 {object} dto.ApiResponse[dto.RestoreResponse]
// @Failure 400 {object} dto.ApiResponse[any]
// @Failure 500 {object} dto.ApiResponse[any]
// @Router /api/backups/restore [post]
func (h *BackupHandler) RestoreDatabase(c *gin.Context) {
	var req dto.RestoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("INVALID_REQUEST", "Invalid request body", nil))
		return
	}

	response, err := h.backupService.Restore(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("RESTORE_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse(*response))
}

// ListBackups handles GET /api/backups - list all backups
// @Summary List backups
// @Description Lists all available backup files
// @Tags backups
// @Produce json
// @Success 200 {object} dto.ApiResponse[dto.BackupListResponse]
// @Failure 500 {object} dto.ApiResponse[any]
// @Router /api/backups [get]
func (h *BackupHandler) ListBackups(c *gin.Context) {
	backupDir := c.Query("directory")

	response, err := h.backupService.ListBackups(c.Request.Context(), backupDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("LIST_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse(*response))
}

// DownloadBackup handles GET /api/backups/:filename - download a backup file
// @Summary Download backup
// @Description Downloads a backup file
// @Tags backups
// @Produce application/octet-stream
// @Param filename path string true "Backup filename"
// @Success 200 {file} binary
// @Failure 400 {object} dto.ApiResponse[any]
// @Failure 404 {object} dto.ApiResponse[any]
// @Router /api/backups/{filename} [get]
func (h *BackupHandler) DownloadBackup(c *gin.Context) {
	filename := c.Param("filename")
	if filename == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("INVALID_FILENAME", "Filename is required", nil))
		return
	}

	backupDir := "./backups"
	filePath := backupDir + "/" + filename

	_, err := h.backupService.GetBackupFile(c.Request.Context(), filePath)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse("FILE_NOT_FOUND", err.Error(), nil))
		return
	}

	// Set headers for file download
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Header("Content-Type", "application/octet-stream")

	c.File(filePath)
}

// DeleteBackup handles DELETE /api/backups/:filename - delete a backup file
// @Summary Delete backup
// @Description Deletes a backup file
// @Tags backups
// @Param filename path string true "Backup filename"
// @Success 200 {object} dto.ApiResponse[any]
// @Failure 400 {object} dto.ApiResponse[any]
// @Failure 500 {object} dto.ApiResponse[any]
// @Router /api/backups/{filename} [delete]
func (h *BackupHandler) DeleteBackup(c *gin.Context) {
	filename := c.Param("filename")
	if filename == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("INVALID_FILENAME", "Filename is required", nil))
		return
	}

	backupDir := "./backups"
	filePath := backupDir + "/" + filename

	if err := h.backupService.DeleteBackup(c.Request.Context(), filePath); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("DELETE_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse(map[string]string{"message": "Backup deleted successfully"}))
}
