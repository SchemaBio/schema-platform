package dto

import "time"

// PatientCreateRequest represents the request to create a patient
type PatientCreateRequest struct {
	Name       string   `json:"name" binding:"required,min=1,max=255"`
	Gender     string   `json:"gender" binding:"omitempty,oneof=MALE FEMALE UNKNOWN"`
	BirthDate  *string  `json:"birthDate" binding:"omitempty"`
	Phenotypes []string `json:"phenotypes" binding:"omitempty"`
}

// PatientUpdateRequest represents the request to update a patient
type PatientUpdateRequest struct {
	Name       *string  `json:"name" binding:"omitempty,min=1,max=255"`
	Gender     *string  `json:"gender" binding:"omitempty,oneof=MALE FEMALE UNKNOWN"`
	BirthDate  *string  `json:"birthDate" binding:"omitempty"`
	Phenotypes []string `json:"phenotypes" binding:"omitempty"`
}

// PatientResponse represents the patient response
type PatientResponse struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	Gender     string    `json:"gender"`
	BirthDate  *string   `json:"birthDate"`
	Phenotypes []string  `json:"phenotypes"`
	CreatedBy  string    `json:"createdBy"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// PatientQueryParams represents the query parameters for listing patients
type PatientQueryParams struct {
	PaginatedRequest
	Name      *string `form:"name" binding:"omitempty"`
	Gender    *string `form:"gender" binding:"omitempty,oneof=MALE FEMALE UNKNOWN"`
	Phenotype *string `form:"phenotype" binding:"omitempty"`
}

// PatientListResponse represents a list of patients with pagination
type PatientListResponse struct {
	Items      []PatientResponse `json:"items"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	PageSize   int               `json:"pageSize"`
	TotalPages int               `json:"totalPages"`
}

// PatientWithSamplesResponse represents a patient with their samples
type PatientWithSamplesResponse struct {
	PatientResponse
	Samples []SampleResponse `json:"samples"`
}
