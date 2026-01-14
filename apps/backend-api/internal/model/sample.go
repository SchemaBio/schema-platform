package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SampleType represents the type of tumor sample
type SampleType string

const (
	SampleTypeFFPE       SampleType = "FFPE"
	SampleTypeFreshTissue SampleType = "FRESH_TISSUE"
	SampleTypeWholeBlood SampleType = "WHOLE_BLOOD"
	SampleTypecfDNA      SampleType = "CFDNA"
	SampleTypePleuralEffusion SampleType = "PLEURAL_EFFUSION"
	SampleTypeBoneMarrow SampleType = "BONE_MARROW"
	SampleTypeOther      SampleType = "OTHER"
)

// IsValid checks if the sample type is valid
func (s SampleType) IsValid() bool {
	switch s {
	case SampleTypeFFPE, SampleTypeFreshTissue, SampleTypeWholeBlood, SampleTypecfDNA,
		SampleTypePleuralEffusion, SampleTypeBoneMarrow, SampleTypeOther:
		return true
	}
	return false
}

// NucleicAcidType represents the type of nucleic acid
type NucleicAcidType string

const (
	NucleicAcidTypeDNA NucleicAcidType = "DNA"
	NucleicAcidTypeRNA NucleicAcidType = "RNA"
)

// IsValid checks if the nucleic acid type is valid
func (t NucleicAcidType) IsValid() bool {
	return t == NucleicAcidTypeDNA || t == NucleicAcidTypeRNA
}

// SomaticSampleStatus represents the processing status of a somatic sample
type SomaticSampleStatus string

const (
	SomaticSampleStatusPending    SomaticSampleStatus = "PENDING"
	SomaticSampleStatusMatched    SomaticSampleStatus = "MATCHED"
	SomaticSampleStatusAnalyzing  SomaticSampleStatus = "ANALYZING"
	SomaticSampleStatusCompleted  SomaticSampleStatus = "COMPLETED"
)

// IsValid checks if the sample status is valid
func (s SomaticSampleStatus) IsValid() bool {
	switch s {
	case SomaticSampleStatusPending, SomaticSampleStatusMatched, SomaticSampleStatusAnalyzing, SomaticSampleStatusCompleted:
		return true
	}
	return false
}

// Sample represents a tumor sample in the Somatic system
type Sample struct {
	ID               uuid.UUID         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	InternalID       string            `gorm:"type:varchar(50)" json:"internalId"`
	Name             string            `gorm:"type:varchar(255);not null" json:"name"`
	Gender           string            `gorm:"type:varchar(20)" json:"gender"`
	Age              int               `gorm:"type:int" json:"age"`
	BirthDate        *time.Time        `gorm:"type:date" json:"birthDate"`
	SampleType       SampleType        `gorm:"type:varchar(50)" json:"sampleType"`
	NucleicAcidType  NucleicAcidType   `gorm:"type:varchar(10)" json:"nucleicAcidType"`
	TumorType        string            `gorm:"type:varchar(100)" json:"tumorType"`
	PairedSampleID   *uuid.UUID        `gorm:"type:uuid;index" json:"pairedSampleId"`
	Status           SomaticSampleStatus `gorm:"type:varchar(20);not null;default:'PENDING'" json:"status"`
	Hospital         string            `gorm:"type:varchar(255)" json:"hospital"`
	TestItems        string            `gorm:"type:text" json:"testItems"`
	DataCount        int               `gorm:"type:int;default:0" json:"dataCount"`
	ExtraInfo        string            `gorm:"type:jsonb" json:"extraInfo"`
	CreatedBy        uuid.UUID         `gorm:"type:uuid;not null" json:"createdBy"`
	CreatedAt        time.Time         `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt        time.Time         `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt        gorm.DeletedAt    `gorm:"index" json:"-"`

	// Relationships
	PairedSample   *Sample          `gorm:"foreignKey:PairedSampleID" json:"-"`
	DataFiles      []DataFile       `gorm:"foreignKey:SampleID" json:"-"`
	AnalysisTasks  []AnalysisTask   `gorm:"foreignKey:SampleID" json:"-"`
}

// TableName returns the table name for Sample
func (Sample) TableName() string {
	return "samples"
}

// BeforeCreate hook to generate UUID if not set
func (s *Sample) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
