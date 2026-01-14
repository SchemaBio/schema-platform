package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SampleSheetStatus represents the status of a sample sheet
type SampleSheetStatus string

const (
	SampleSheetStatusProcessing SampleSheetStatus = "processing"
	SampleSheetStatusCompleted  SampleSheetStatus = "completed"
	SampleSheetStatusError      SampleSheetStatus = "error"
)

// IsValid checks if the status is valid
func (s SampleSheetStatus) IsValid() bool {
	switch s {
	case SampleSheetStatusProcessing, SampleSheetStatusCompleted, SampleSheetStatusError:
		return true
	}
	return false
}

// SampleSheet represents a SampleSheet (样本上机清单) in the system
type SampleSheet struct {
	ID            uuid.UUID        `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	FileName      string           `gorm:"type:varchar(255);not null" json:"fileName"`
	RunID         *uuid.UUID       `gorm:"type:uuid;index" json:"runId"`
	SequencerID   *uuid.UUID       `gorm:"type:uuid;index" json:"sequencerId"`
	SampleCount   int              `gorm:"type:int;default:0" json:"sampleCount"`
	MatchedCount  int              `gorm:"type:int;default:0" json:"matchedCount"`
	UnmatchedCount int             `gorm:"type:int;default:0" json:"unmatchedCount"`
	Status        SampleSheetStatus `gorm:"type:varchar(20);not null;default:'processing'" json:"status"`
	UploadedBy    *uuid.UUID       `gorm:"type:uuid" json:"uploadedBy"`
	UploadedAt    *time.Time       `gorm:"-" json:"uploadedAt"`
	CreatedAt     time.Time        `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt     time.Time        `gorm:"autoUpdateTime" json:"updatedAt"`

	// Relationships
	Run       *SequencingRun `gorm:"foreignKey:RunID" json:"-"`
	Sequencer *Sequencer     `gorm:"foreignKey:SequencerID" json:"-"`
	Indices   []SampleIndex  `gorm:"foreignKey:SampleSheetID" json:"-"`
}

// TableName returns the table name for SampleSheet
func (SampleSheet) TableName() string {
	return "sample_sheets"
}

// BeforeCreate hook to generate UUID if not set
func (s *SampleSheet) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
