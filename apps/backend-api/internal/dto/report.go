package dto

import "github.com/google/uuid"

// CreateReportRequest is the request body for creating a report
type CreateReportRequest struct {
	Title      string     `json:"title" binding:"required"`
	TemplateID *uuid.UUID `json:"templateId"`
}

// UpdateReportStatusRequest is the request body for updating report status
type UpdateReportStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

// UploadReportRequest is the request body for uploading a report
type UploadReportRequest struct {
	Title     string `json:"title" binding:"required"`
	FileName  string `json:"fileName" binding:"required"`
	FileType  string `json:"fileType" binding:"required"`
	FileData  []byte `json:"fileData"`
}