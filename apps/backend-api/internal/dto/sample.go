package dto

import "time"

// CreateSampleRequest represents the request to create a Somatic sample
type CreateSampleRequest struct {
	InternalID       string     `json:"internalId" binding:"omitempty,max=50"`
	Name             string     `json:"name" binding:"required,min=1,max=255"`
	Gender           string     `json:"gender" binding:"omitempty,oneof=male female unknown"`
	Age              int        `json:"age" binding:"omitempty,min=0,max=150"`
	BirthDate        *time.Time `json:"birthDate"`
	SampleType       string     `json:"sampleType" binding:"required,oneof=FFPE FRESH_TISSUE WHOLE_BLOOD CFDNA PLEURAL_EFFUSION BONE_MARROW OTHER"`
	NucleicAcidType  string     `json:"nucleicAcidType" binding:"omitempty,oneof=DNA RNA"`
	TumorType        string     `json:"tumorType" binding:"omitempty,max=100"`
	PairedSampleID   *string    `json:"pairedSampleId" binding:"omitempty,uuid"`
	Hospital         string     `json:"hospital" binding:"omitempty,max=255"`
	TestItems        string     `json:"testItems"`
	ExtraInfo        string     `json:"extraInfo"`
}

// UpdateSampleRequest represents the request to update a Somatic sample
type UpdateSampleRequest struct {
	InternalID      *string `json:"internalId" binding:"omitempty,max=50"`
	Name            *string `json:"name" binding:"omitempty,min=1,max=255"`
	Gender          *string `json:"gender" binding:"omitempty,oneof=male female unknown"`
	Age             *int    `json:"age" binding:"omitempty,min=0,max=150"`
	SampleType      *string `json:"sampleType" binding:"omitempty,oneof=FFPE FRESH_TISSUE WHOLE_BLOOD CFDNA PLEURAL_EFFUSION BONE_MARROW OTHER"`
	NucleicAcidType *string `json:"nucleicAcidType" binding:"omitempty,oneof=DNA RNA"`
	TumorType       *string `json:"tumorType" binding:"omitempty,max=100"`
	Status          *string `json:"status" binding:"omitempty,oneof=PENDING MATCHED ANALYZING COMPLETED"`
	Hospital        *string `json:"hospital" binding:"omitempty,max=255"`
	TestItems       *string `json:"testItems"`
	ExtraInfo       *string `json:"extraInfo"`
}

// SampleResponse represents the Somatic sample response
type SampleResponse struct {
	ID              string     `json:"id"`
	InternalID      string     `json:"internalId"`
	Name            string     `json:"name"`
	Gender          string     `json:"gender"`
	Age             int        `json:"age"`
	BirthDate       *time.Time `json:"birthDate"`
	SampleType      string     `json:"sampleType"`
	NucleicAcidType string     `json:"nucleicAcidType"`
	TumorType       string     `json:"tumorType"`
	PairedSampleID  *string    `json:"pairedSampleId"`
	Status          string     `json:"status"`
	Hospital        string     `json:"hospital"`
	TestItems       string     `json:"testItems"`
	DataCount       int        `json:"dataCount"`
	ExtraInfo       string     `json:"extraInfo"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

// SampleQueryParams represents the query parameters for listing Somatic samples
type SampleQueryParams struct {
	PaginatedRequest
	Status     *string `form:"status" binding:"omitempty,oneof=PENDING MATCHED ANALYZING COMPLETED"`
	TumorType  *string `form:"tumorType"`
	Hospital   *string `form:"hospital"`
	SampleType *string `form:"sampleType" binding:"omitempty,oneof=FFPE FRESH_TISSUE WHOLE_BLOOD CFDNA PLEURAL_EFFUSION BONE_MARROW OTHER"`
}

// SampleListResponse represents a list of samples with pagination
type SampleListResponse struct {
	Items      []SampleResponse `json:"items"`
	Total      int64            `json:"total"`
	Page       int              `json:"page"`
	PageSize   int              `json:"pageSize"`
	TotalPages int              `json:"totalPages"`
}
