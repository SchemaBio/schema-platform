package dto

import "time"

// SampleSheetRequest represents the request to create/update a sample sheet
type SampleSheetRequest struct {
	FileName    string `json:"fileName" binding:"required,max=255"`
	RunID       string `json:"runId" binding:"omitempty,uuid"`
	SequencerID string `json:"sequencerId" binding:"omitempty,uuid"`
	Status      string `json:"status" binding:"omitempty,oneof=processing completed error"`
}

// SampleSheetResponse represents the sample sheet response
type SampleSheetResponse struct {
	ID             string     `json:"id"`
	FileName       string     `json:"fileName"`
	RunID          *string    `json:"runId"`
	SequencerID    *string    `json:"sequencerId"`
	SampleCount    int        `json:"sampleCount"`
	MatchedCount   int        `json:"matchedCount"`
	UnmatchedCount int        `json:"unmatchedCount"`
	Status         string     `json:"status"`
	UploadedBy     *string    `json:"uploadedBy"`
	UploadedAt     *time.Time `json:"uploadedAt"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

// SampleSheetListResponse represents a list of sample sheets with pagination
type SampleSheetListResponse struct {
	Items      []SampleSheetResponse `json:"items"`
	Total      int64                 `json:"total"`
	Page       int                   `json:"page"`
	PageSize   int                   `json:"pageSize"`
	TotalPages int                   `json:"totalPages"`
}

// SampleIndexRequest represents the request to create/update a sample index
type SampleIndexRequest struct {
	SampleSheetID string `json:"sampleSheetId" binding:"required,uuid"`
	SampleID      string `json:"sampleId" binding:"omitempty,uuid"`
	Lane          string `json:"lane" binding:"omitempty,max=10"`
	Index5        string `json:"index5" binding:"omitempty,max=20"`
	Index7        string `json:"index7" binding:"omitempty,max=20"`
	ProjectName   string `json:"projectName" binding:"omitempty,max=100"`
	Description   string `json:"description" binding:"omitempty,max=255"`
}

// SampleIndexResponse represents the sample index response
type SampleIndexResponse struct {
	ID            string     `json:"id"`
	SampleSheetID string     `json:"sampleSheetId"`
	SampleID      *string    `json:"sampleId"`
	Lane          string     `json:"lane"`
	Index5        string     `json:"index5"`
	Index7        string     `json:"index7"`
	ProjectName   string     `json:"projectName"`
	Description   string     `json:"description"`
	Matched       bool       `json:"matched"`
	CreatedAt     time.Time  `json:"createdAt"`
}

// DataFileRequest represents the request to create/update a data file
type DataFileRequest struct {
	SampleID   string `json:"sampleId" binding:"omitempty,uuid"`
	RunID      string `json:"runId" binding:"omitempty,uuid"`
	Lane       string `json:"lane" binding:"omitempty,max=10"`
	FileName   string `json:"fileName" binding:"required,max=255"`
	FilePath   string `json:"filePath"`
	FileSize   int64  `json:"fileSize"`
	FileType   string `json:"fileType" binding:"required,oneof=fastq fastq.gz bam ubam cram"`
	ReadType   string `json:"readType" binding:"omitempty,oneof=R1 R2 SE"`
	MD5Hash    string `json:"md5Hash" binding:"omitempty,max=32"`
	Status     string `json:"status" binding:"omitempty,oneof=pending imported archived deleted"`
}

// DataFileResponse represents the data file response
type DataFileResponse struct {
	ID         string     `json:"id"`
	SampleID   *string    `json:"sampleId"`
	RunID      *string    `json:"runId"`
	Lane       string     `json:"lane"`
	FileName   string     `json:"fileName"`
	FilePath   string     `json:"filePath"`
	FileSize   int64      `json:"fileSize"`
	FileType   string     `json:"fileType"`
	ReadType   string     `json:"readType"`
	MD5Hash    string     `json:"md5Hash"`
	Status     string     `json:"status"`
	ImportedAt *time.Time `json:"importedAt"`
	CreatedAt  time.Time  `json:"createdAt"`
}

// DataFileListResponse represents a list of data files with pagination
type DataFileListResponse struct {
	Items      []DataFileResponse `json:"items"`
	Total      int64              `json:"total"`
	Page       int                `json:"page"`
	PageSize   int                `json:"pageSize"`
	TotalPages int                `json:"totalPages"`
}
