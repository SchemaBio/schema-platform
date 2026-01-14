package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// BasePipelineType represents the base pipeline type
type BasePipelineType string

const (
	BasePipelineTissueSingle  BasePipelineType = "tissue_single"
	BasePipelineTissuePaired  BasePipelineType = "tissue_paired"
	BasePipelinePlasmaSingle  BasePipelineType = "plasma_single"
	BasePipelinePlasmaPaired  BasePipelineType = "plasma_paired"
	BasePipelineRNAFusion     BasePipelineType = "rna_fusion"
)

// IsValid checks if the pipeline type is valid
func (t BasePipelineType) IsValid() bool {
	switch t {
	case BasePipelineTissueSingle, BasePipelineTissuePaired, BasePipelinePlasmaSingle,
		BasePipelinePlasmaPaired, BasePipelineRNAFusion:
		return true
	}
	return false
}

// PipelineStatus represents the status of a pipeline
type PipelineStatus string

const (
	PipelineStatusActive   PipelineStatus = "active"
	PipelineStatusInactive PipelineStatus = "inactive"
)

// IsValid checks if the status is valid
func (s PipelineStatus) IsValid() bool {
	return s == PipelineStatusActive || s == PipelineStatusInactive
}

// ReferenceGenome represents the reference genome version
type ReferenceGenome string

const (
	ReferenceGenomeHG19 ReferenceGenome = "hg19"
	ReferenceGenomeHG38 ReferenceGenome = "hg38"
)

// IsValid checks if the reference genome is valid
func (g ReferenceGenome) IsValid() bool {
	return g == ReferenceGenomeHG19 || g == ReferenceGenomeHG38
}

// Pipeline represents an analysis pipeline configuration
type Pipeline struct {
	ID             uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name           string         `gorm:"type:varchar(100);not null" json:"name"`
	BasePipeline   BasePipelineType `gorm:"type:varchar(50);not null" json:"basePipeline"`
	Version        string         `gorm:"type:varchar(20);not null" json:"version"`
	Description    string         `gorm:"type:text" json:"description"`
	BEDFile        string         `gorm:"type:varchar(255)" json:"bedFile"`
	ReferenceGenome ReferenceGenome `gorm:"type:varchar(20)" json:"referenceGenome"`
	CNVBaseline    string         `gorm:"type:varchar(255)" json:"cnvBaseline"`
	MSIBaseline    string         `gorm:"type:varchar(255)" json:"msiBaseline"`
	Status         PipelineStatus `gorm:"type:varchar(20);not null;default:'active'" json:"status"`
	CreatedAt      time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt      time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`

	// Relationships
	AnalysisTasks []AnalysisTask `gorm:"foreignKey:PipelineID" json:"-"`
}

// TableName returns the table name for Pipeline
func (Pipeline) TableName() string {
	return "pipelines"
}

// BeforeCreate hook to generate UUID if not set
func (p *Pipeline) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
