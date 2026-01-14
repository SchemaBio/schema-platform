package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SangerStatus represents the status of a Sanger validation
type SangerStatus string

const (
	SangerStatusPending    SangerStatus = "Pending"
	SangerStatusInProgress SangerStatus = "InProgress"
	SangerStatusCompleted  SangerStatus = "Completed"
	SangerStatusFailed     SangerStatus = "Failed"
)

// SangerResult represents the result of a Sanger validation
type SangerResult string

const (
	SangerResultConfirmed       SangerResult = "Confirmed"
	SangerResultNotConfirmed    SangerResult = "NotConfirmed"
	SangerResultInconclusive    SangerResult = "Inconclusive"
)

// SangerValidation represents a Sanger sequencing validation record
type SangerValidation struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	TaskID        uuid.UUID      `gorm:"type:uuid;not null;index" json:"taskId"`
	VariantID     string         `gorm:"size:255;index" json:"variantId"`
	VariantType   string         `gorm:"size:20" json:"variantType"` // SNV, Indel, CNV
	Gene          string         `gorm:"size:50;index" json:"gene"`
	Chromosome    string         `gorm:"size:10" json:"chromosome"`
	Position      int64          `json:"position"`
	HGVSC         string         `gorm:"size:50" json:"hgvsc"`
	HVGSP         string         `gorm:"size:50" json:"hgvsp"`
	Zygosity      string         `gorm:"size:20" json:"zygosity"`
	Status        SangerStatus   `gorm:"size:50;not null;default:Pending" json:"status"`
	Result        SangerResult   `gorm:"size:50" json:"result"`
	PrimerForward string         `gorm:"size:100" json:"primerForward"`
	PrimerReverse string         `gorm:"size:100" json:"primerReverse"`
	ProductSize   int            `json:"productSize"`
	RequestedBy   uuid.UUID      `gorm:"type:uuid;index" json:"requestedBy"`
	RequestedAt   time.Time      `json:"requestedAt"`
	CompletedBy   *uuid.UUID     `gorm:"type:uuid" json:"completedBy,omitempty"`
	CompletedAt   *time.Time     `json:"completedAt,omitempty"`
	Notes         string         `gorm:"type:text" json:"notes"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Task *AnalysisTask `gorm:"foreignKey:TaskID" json:"-"`
}

// BeforeCreate sets the UUID for new SangerValidation
func (sv *SangerValidation) BeforeCreate(tx *gorm.DB) error {
	if sv.ID == uuid.Nil {
		sv.ID = uuid.New()
	}
	if sv.RequestedAt.IsZero() {
		sv.RequestedAt = time.Now()
	}
	return nil
}
