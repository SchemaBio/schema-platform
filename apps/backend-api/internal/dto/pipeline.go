package dto

import "time"

// PipelineRequest represents the request to create/update a pipeline
type PipelineRequest struct {
	Name            string `json:"name" binding:"required,max=100"`
	BasePipeline    string `json:"basePipeline" binding:"required,oneof=tissue_single tissue_paired plasma_single plasma_paired rna_fusion"`
	Version         string `json:"version" binding:"required,max=20"`
	Description     string `json:"description"`
	BEDFile         string `json:"bedFile"`
	ReferenceGenome string `json:"referenceGenome" binding:"omitempty,oneof=hg19 hg38"`
	CNVBaseline     string `json:"cnvBaseline"`
	MSIBaseline     string `json:"msiBaseline"`
	Status          string `json:"status" binding:"omitempty,oneof=active inactive"`
}

// PipelineResponse represents the pipeline response
type PipelineResponse struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	BasePipeline   string    `json:"basePipeline"`
	Version        string    `json:"version"`
	Description    string    `json:"description"`
	BEDFile        string    `json:"bedFile"`
	ReferenceGenome string   `json:"referenceGenome"`
	CNVBaseline    string    `json:"cnvBaseline"`
	MSIBaseline    string    `json:"msiBaseline"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

// PipelineListResponse represents a list of pipelines with pagination
type PipelineListResponse struct {
	Items      []PipelineResponse `json:"items"`
	Total      int64              `json:"total"`
	Page       int                `json:"page"`
	PageSize   int                `json:"pageSize"`
	TotalPages int                `json:"totalPages"`
}

// AnalysisTaskRequest represents the request to create/update an analysis task
type AnalysisTaskRequest struct {
	Name              string `json:"name" binding:"required,max=255"`
	SampleID          string `json:"sampleId" binding:"required,uuid"`
	PipelineID        string `json:"pipelineId" binding:"omitempty,uuid"`
	PipelineVersion   string `json:"pipelineVersion" binding:"omitempty,max=50"`
	InputDataPath     string `json:"inputDataPath"`
	OutputParquetPath string `json:"outputParquetPath"`
}

// AnalysisTaskResponse represents the analysis task response
type AnalysisTaskResponse struct {
	ID                string     `json:"id"`
	Name              string     `json:"name"`
	SampleID          string     `json:"sampleId"`
	PipelineID        *string    `json:"pipelineId"`
	PipelineVersion   string     `json:"pipelineVersion"`
	Status            string     `json:"status"`
	InputDataPath     string     `json:"inputDataPath"`
	OutputParquetPath string     `json:"outputParquetPath"`
	CreatedBy         string     `json:"createdBy"`
	CreatedAt         time.Time  `json:"createdAt"`
	StartedAt         *time.Time `json:"startedAt"`
	CompletedAt       *time.Time `json:"completedAt"`
	ErrorMessage      string     `json:"errorMessage"`
}

// AnalysisTaskListResponse represents a list of analysis tasks with pagination
type AnalysisTaskListResponse struct {
	Items      []AnalysisTaskResponse `json:"items"`
	Total      int64                  `json:"total"`
	Page       int                    `json:"page"`
	PageSize   int                    `json:"pageSize"`
	TotalPages int                    `json:"totalPages"`
}

// AnalysisTaskQueryParams represents query parameters for analysis tasks
type AnalysisTaskQueryParams struct {
	PaginatedRequest
	SampleID   *string `form:"sampleId" binding:"omitempty,uuid"`
	PipelineID *string `form:"pipelineId" binding:"omitempty,uuid"`
	Status     *string `form:"status" binding:"omitempty,oneof=QUEUED RUNNING COMPLETED FAILED PENDING_INTERPRETATION"`
}

// ResultFileResponse represents the result file response
type ResultFileResponse struct {
	ID          string    `json:"id"`
	TaskID      string    `json:"taskId"`
	ResultType  string    `json:"resultType"`
	FilePath    string    `json:"filePath"`
	FileSize    int64     `json:"fileSize"`
	RecordCount int       `json:"recordCount"`
	CreatedAt   time.Time `json:"createdAt"`
}

// StorageSourceRequest represents the request to create/update a storage source
type StorageSourceRequest struct {
	Name        string `json:"name" binding:"required,max=100"`
	Protocol    string `json:"protocol" binding:"required,oneof=webdav s3 smb"`
	Endpoint    string `json:"endpoint" binding:"omitempty,max=500"`
	BasePath    string `json:"basePath"`
	Credentials string `json:"credentials"`
	IsDefault   bool   `json:"isDefault"`
}

// StorageSourceResponse represents the storage source response
type StorageSourceResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Protocol    string    `json:"protocol"`
	Endpoint    string    `json:"endpoint"`
	BasePath    string    `json:"basePath"`
	IsDefault   bool      `json:"isDefault"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// StorageSourceListResponse represents a list of storage sources with pagination
type StorageSourceListResponse struct {
	Items      []StorageSourceResponse `json:"items"`
	Total      int64                   `json:"total"`
	Page       int                     `json:"page"`
	PageSize   int                     `json:"pageSize"`
	TotalPages int                     `json:"totalPages"`
}
