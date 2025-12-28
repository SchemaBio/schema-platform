package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SampleType represents the type of genomic sample
type SampleType string

const (
	SampleTypeGermline        SampleType = "GERMLINE"
	SampleTypeSomatic         SampleType = "SOMATIC"
	SampleTypeTumorNormalPair SampleType = "TUMOR_NORMAL_PAIR"
)

// IsValid checks if the sample type is valid
func (s SampleType) IsValid() bool {
	switch s {
	case SampleTypeGermline, SampleTypeSomatic, SampleTypeTumorNormalPair:
		return true
	}
	return false
}

// SampleStatus represents the processing status of a sample
type SampleStatus string

const (
	SampleStatusPending    SampleStatus = "PENDING"
	SampleStatusProcessing SampleStatus = "PROCESSING"
	SampleStatusCompleted  SampleStatus = "COMPLETED"
	SampleStatusFailed     SampleStatus = "FAILED"
)

// IsValid checks if the sample status is valid
func (s SampleStatus) IsValid() bool {
	switch s {
	case SampleStatusPending, SampleStatusProcessing, SampleStatusCompleted, SampleStatusFailed:
		return true
	}
	return false
}

// Sample represents a genomic sample in the system
type Sample struct {
	ID         uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name       string         `gorm:"type:varchar(255);not null" json:"name"`
	PatientID  uuid.UUID      `gorm:"type:uuid;not null;index" json:"patientId"`
	SampleType SampleType     `gorm:"type:varchar(30);not null" json:"sampleType"`
	Status     SampleStatus   `gorm:"type:varchar(20);not null;default:'PENDING'" json:"status"`
	BatchID    *uuid.UUID     `gorm:"type:uuid;index" json:"batchId"`
	CreatedBy  uuid.UUID      `gorm:"type:uuid;not null" json:"createdBy"`
	CreatedAt  time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt  time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Patient *Patient `gorm:"foreignKey:PatientID" json:"-"`
	Batch   *Batch   `gorm:"foreignKey:BatchID" json:"-"`
	Creator *User    `gorm:"foreignKey:CreatedBy" json:"-"`
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
