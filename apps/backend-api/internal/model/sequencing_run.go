package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SequencingRunStatus represents the status of a sequencing run
type SequencingRunStatus string

const (
	SequencingRunStatusPending   SequencingRunStatus = "pending"
	SequencingRunStatusRunning   SequencingRunStatus = "running"
	SequencingRunStatusCompleted SequencingRunStatus = "completed"
	SequencingRunStatusFailed    SequencingRunStatus = "failed"
)

// IsValid checks if the status is valid
func (s SequencingRunStatus) IsValid() bool {
	switch s {
	case SequencingRunStatusPending, SequencingRunStatusRunning, SequencingRunStatusCompleted, SequencingRunStatusFailed:
		return true
	}
	return false
}

// SequencingRun represents a sequencing run (Run) in the system
type SequencingRun struct {
	ID                    uuid.UUID             `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	RunID                 string                `gorm:"type:varchar(50);uniqueIndex" json:"runId"`
	SequencerID           uuid.UUID             `gorm:"type:uuid;not null;index" json:"sequencerId"`
	FlowcellID            string                `gorm:"type:varchar(100)" json:"flowcellId"`
	FlowcellType          string                `gorm:"type:varchar(50)" json:"flowcellType"`
	SequencingDate        *time.Time            `gorm:"type:date" json:"sequencingDate"`
	ReadLength            string                `gorm:"type:varchar(20)" json:"readLength"`
	TotalYieldGB          float64               `gorm:"type:decimal(10,2)" json:"totalYieldGb"`
	Q30Rate               float64               `gorm:"type:decimal(5,4)" json:"q30Rate"`
	PassingFilterClusters int64                 `gorm:"type:bigint" json:"passingFilterClusters"`
	Status                SequencingRunStatus   `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`
	Notes                 string                `gorm:"type:text" json:"notes"`
	CreatedAt             time.Time             `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt             time.Time             `gorm:"autoUpdateTime" json:"updatedAt"`

	// Relationships
	Sequencer *Sequencer `gorm:"foreignKey:SequencerID" json:"-"`
}

// TableName returns the table name for SequencingRun
func (SequencingRun) TableName() string {
	return "sequencing_runs"
}

// BeforeCreate hook to generate UUID if not set
func (s *SequencingRun) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
