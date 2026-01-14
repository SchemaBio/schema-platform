package dto

import "time"

// SequencerRequest represents the request to create/update a sequencer
type SequencerRequest struct {
	Name         string `json:"name" binding:"required,min=1,max=100"`
	SerialNumber string `json:"serialNumber" binding:"required,max=100"`
	Platform     string `json:"platform" binding:"required,oneof=illumina bgi"`
	Model        string `json:"model" binding:"omitempty,max=100"`
	DataPath     string `json:"dataPath"`
	Status       string `json:"status" binding:"omitempty,oneof=online offline maintenance"`
}

// SequencerResponse represents the sequencer response
type SequencerResponse struct {
	ID           string     `json:"id"`
	Name         string     `json:"name"`
	SerialNumber string     `json:"serialNumber"`
	Platform     string     `json:"platform"`
	Model        string     `json:"model"`
	DataPath     string     `json:"dataPath"`
	Status       string     `json:"status"`
	LastSyncAt   *time.Time `json:"lastSyncAt"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
}

// SequencerListResponse represents a list of sequencers with pagination
type SequencerListResponse struct {
	Items      []SequencerResponse `json:"items"`
	Total      int64               `json:"total"`
	Page       int                 `json:"page"`
	PageSize   int                 `json:"pageSize"`
	TotalPages int                 `json:"totalPages"`
}

// SequencingRunRequest represents the request to create/update a sequencing run
type SequencingRunRequest struct {
	RunID          string  `json:"runId" binding:"required,max=50"`
	SequencerID    string  `json:"sequencerId" binding:"required,uuid"`
	FlowcellID     string  `json:"flowcellId" binding:"omitempty,max=100"`
	FlowcellType   string  `json:"flowcellType" binding:"omitempty,max=50"`
	SequencingDate string  `json:"sequencingDate" binding:"omitempty"`
	ReadLength     string  `json:"readLength" binding:"omitempty,max=20"`
	TotalYieldGB   float64 `json:"totalYieldGb"`
	Q30Rate        float64 `json:"q30Rate"`
	Status         string  `json:"status" binding:"omitempty,oneof=pending running completed failed"`
	Notes          string  `json:"notes"`
}

// SequencingRunResponse represents the sequencing run response
type SequencingRunResponse struct {
	ID                    string     `json:"id"`
	RunID                 string     `json:"runId"`
	SequencerID           string     `json:"sequencerId"`
	FlowcellID            string     `json:"flowcellId"`
	FlowcellType          string     `json:"flowcellType"`
	SequencingDate        *time.Time `json:"sequencingDate"`
	ReadLength            string     `json:"readLength"`
	TotalYieldGB          float64    `json:"totalYieldGb"`
	Q30Rate               float64    `json:"q30Rate"`
	PassingFilterClusters int64      `json:"passingFilterClusters"`
	Status                string     `json:"status"`
	Notes                 string     `json:"notes"`
	CreatedAt             time.Time  `json:"createdAt"`
	UpdatedAt             time.Time  `json:"updatedAt"`
}

// SequencingRunListResponse represents a list of sequencing runs with pagination
type SequencingRunListResponse struct {
	Items      []SequencingRunResponse `json:"items"`
	Total      int64                   `json:"total"`
	Page       int                     `json:"page"`
	PageSize   int                     `json:"pageSize"`
	TotalPages int                     `json:"totalPages"`
}
