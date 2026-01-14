package dto

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// GeneListCreateRequest represents a request to create a gene list
type GeneListCreateRequest struct {
	Name            string         `json:"name" binding:"required,min=1,max=100"`
	Description     string         `json:"description" binding:"omitempty"`
	Genes           datatypes.JSON `json:"genes" binding:"required"` // Array of gene symbols
	Category        string         `json:"category" binding:"omitempty,oneof=core important optional"`
	DiseaseCategory string         `json:"diseaseCategory" binding:"omitempty,max=100"`
}

// GeneListUpdateRequest represents a request to update a gene list
type GeneListUpdateRequest struct {
	Name            *string         `json:"name" binding:"omitempty,min=1,max=100"`
	Description     *string         `json:"description" binding:"omitempty"`
	Genes           *datatypes.JSON `json:"genes" binding:"omitempty"`
	Category        *string         `json:"category" binding:"omitempty,oneof=core important optional"`
	DiseaseCategory *string         `json:"diseaseCategory" binding:"omitempty,max=100"`
}

// GeneListResponse represents a gene list response
type GeneListResponse struct {
	ID              uuid.UUID      `json:"id"`
	Name            string         `json:"name"`
	Description     string         `json:"description,omitempty"`
	Genes           datatypes.JSON `json:"genes"`
	GeneCount       int            `json:"geneCount"`
	Category        string         `json:"category,omitempty"`
	DiseaseCategory string         `json:"diseaseCategory,omitempty"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
}

// GeneListDetailResponse represents a detailed gene list response
type GeneListDetailResponse struct {
	ID              uuid.UUID      `json:"id"`
	Name            string         `json:"name"`
	Description     string         `json:"description,omitempty"`
	Genes           datatypes.JSON `json:"genes"`
	GeneCount       int            `json:"geneCount"`
	Category        string         `json:"category,omitempty"`
	DiseaseCategory string         `json:"diseaseCategory,omitempty"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
}
