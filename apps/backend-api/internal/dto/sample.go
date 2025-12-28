package dto

import "time"

// SampleCreateRequest represents the request to create a sample
type SampleCreateRequest struct {
	Name       string  `json:"name" binding:"required,min=1,max=255"`
	PatientID  string  `json:"patientId" binding:"required,uuid"`
	SampleType string  `json:"sampleType" binding:"required,oneof=GERMLINE SOMATIC TUMOR_NORMAL_PAIR"`
	BatchID    *string `json:"batchId" binding:"omitempty,uuid"`
}

// SampleUpdateRequest represents the request to update a sample
type SampleUpdateRequest struct {
	Name    *string `json:"name" binding:"omitempty,min=1,max=255"`
	Status  *string `json:"status" binding:"omitempty,oneof=PENDING PROCESSING COMPLETED FAILED"`
	BatchID *string `json:"batchId" binding:"omitempty,uuid"`
}

// SampleResponse represents the sample response
type SampleResponse struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	PatientID  string    `json:"patientId"`
	SampleType string    `json:"sampleType"`
	Status     string    `json:"status"`
	BatchID    *string   `json:"batchId"`
	CreatedBy  string    `json:"createdBy"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// SampleQueryParams represents the query parameters for listing samples
type SampleQueryParams struct {
	PaginatedRequest
	Status    *string `form:"status" binding:"omitempty,oneof=PENDING PROCESSING COMPLETED FAILED"`
	PatientID *string `form:"patientId" binding:"omitempty,uuid"`
	BatchID   *string `form:"batchId" binding:"omitempty,uuid"`
	StartDate *string `form:"startDate" binding:"omitempty"`
	EndDate   *string `form:"endDate" binding:"omitempty"`
}

// SampleListResponse represents a list of samples with pagination
type SampleListResponse struct {
	Items      []SampleResponse `json:"items"`
	Total      int64            `json:"total"`
	Page       int              `json:"page"`
	PageSize   int              `json:"pageSize"`
	TotalPages int              `json:"totalPages"`
}
