package dto

import "time"

// BEDFileRequest represents the request to create/update a BED file
type BEDFileRequest struct {
	Name         string `json:"name" binding:"required,max=100"`
	Description  string `json:"description"`
	FilePath     string `json:"filePath" binding:"required"`
	TargetSizeBP int64  `json:"targetSizeBp"`
	PanelVersion string `json:"panelVersion" binding:"omitempty,max=50"`
	GeneCount    int    `json:"geneCount"`
}

// BEDFileResponse represents the BED file response
type BEDFileResponse struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	FilePath     string    `json:"filePath"`
	TargetSizeBP int64     `json:"targetSizeBp"`
	PanelVersion string    `json:"panelVersion"`
	GeneCount    int       `json:"geneCount"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// BEDFileListResponse represents a list of BED files with pagination
type BEDFileListResponse struct {
	Items      []BEDFileResponse `json:"items"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	PageSize   int               `json:"pageSize"`
	TotalPages int               `json:"totalPages"`
}

// BaselineFileRequest represents the request to create/update a baseline file
type BaselineFileRequest struct {
	Name         string `json:"name" binding:"required,max=100"`
	BaselineType string `json:"baselineType" binding:"required,oneof=cnv msi other"`
	FilePath     string `json:"filePath" binding:"required"`
	Version      string `json:"version" binding:"omitempty,max=20"`
	Description  string `json:"description"`
}

// BaselineFileResponse represents the baseline file response
type BaselineFileResponse struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	BaselineType string    `json:"baselineType"`
	FilePath     string    `json:"filePath"`
	Version      string    `json:"version"`
	Description  string    `json:"description"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// BaselineFileListResponse represents a list of baseline files with pagination
type BaselineFileListResponse struct {
	Items      []BaselineFileResponse `json:"items"`
	Total      int64                  `json:"total"`
	Page       int                    `json:"page"`
	PageSize   int                    `json:"pageSize"`
	TotalPages int                    `json:"totalPages"`
}
