package dto

import "time"

// BatchCreateRequest represents the request to create a batch
type BatchCreateRequest struct {
	Name      string   `json:"name" binding:"required,min=1,max=255"`
	SampleIDs []string `json:"sampleIds" binding:"omitempty,dive,uuid"`
}

// BatchUpdateRequest represents the request to update a batch
type BatchUpdateRequest struct {
	Name   *string `json:"name" binding:"omitempty,min=1,max=255"`
	Status *string `json:"status" binding:"omitempty,oneof=PENDING PROCESSING COMPLETED FAILED"`
}

// BatchAddSamplesRequest represents the request to add samples to a batch
type BatchAddSamplesRequest struct {
	SampleIDs []string `json:"sampleIds" binding:"required,min=1,dive,uuid"`
}

// BatchResponse represents the batch response
type BatchResponse struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Status      string     `json:"status"`
	CreatedBy   string     `json:"createdBy"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
	CompletedAt *time.Time `json:"completedAt"`
}

// BatchQueryParams represents the query parameters for listing batches
type BatchQueryParams struct {
	PaginatedRequest
	Status *string `form:"status" binding:"omitempty,oneof=PENDING PROCESSING COMPLETED FAILED"`
}

// BatchListResponse represents a list of batches with pagination
type BatchListResponse struct {
	Items      []BatchResponse `json:"items"`
	Total      int64           `json:"total"`
	Page       int             `json:"page"`
	PageSize   int             `json:"pageSize"`
	TotalPages int             `json:"totalPages"`
}

// BatchWithSamplesResponse represents a batch with its samples
type BatchWithSamplesResponse struct {
	BatchResponse
	Samples []SampleResponse `json:"samples"`
}
