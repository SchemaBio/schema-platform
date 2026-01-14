package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SequencerPlatform represents the sequencing platform type
type SequencerPlatform string

const (
	SequencerPlatformIllumina SequencerPlatform = "illumina"
	SequencerPlatformBGI      SequencerPlatform = "bgi"
)

// IsValid checks if the platform is valid
func (p SequencerPlatform) IsValid() bool {
	switch p {
	case SequencerPlatformIllumina, SequencerPlatformBGI:
		return true
	}
	return false
}

// SequencerStatus represents the status of a sequencer
type SequencerStatus string

const (
	SequencerStatusOnline      SequencerStatus = "online"
	SequencerStatusOffline     SequencerStatus = "offline"
	SequencerStatusMaintenance SequencerStatus = "maintenance"
)

// IsValid checks if the status is valid
func (s SequencerStatus) IsValid() bool {
	switch s {
	case SequencerStatusOnline, SequencerStatusOffline, SequencerStatusMaintenance:
		return true
	}
	return false
}

// Sequencer represents a sequencing platform/sequencer in the system
type Sequencer struct {
	ID           uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name         string         `gorm:"type:varchar(100);not null" json:"name"`
	SerialNumber string         `gorm:"type:varchar(100);uniqueIndex" json:"serialNumber"`
	Platform     SequencerPlatform `gorm:"type:varchar(20);not null" json:"platform"`
	Model        string         `gorm:"type:varchar(100)" json:"model"`
	DataPath     string         `gorm:"type:text" json:"dataPath"`
	Status       SequencerStatus `gorm:"type:varchar(20);not null;default:'offline'" json:"status"`
	LastSyncAt   *time.Time     `gorm:"-" json:"lastSyncAt"`
	CreatedAt    time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
}

// TableName returns the table name for Sequencer
func (Sequencer) TableName() string {
	return "sequencers"
}

// BeforeCreate hook to generate UUID if not set
func (s *Sequencer) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
