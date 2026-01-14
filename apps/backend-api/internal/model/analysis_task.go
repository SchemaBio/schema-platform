package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AnalysisTaskStatus represents the status of an analysis task
type AnalysisTaskStatus string

const (
	AnalysisTaskStatusQueued               AnalysisTaskStatus = "QUEUED"
	AnalysisTaskStatusRunning              AnalysisTaskStatus = "RUNNING"
	AnalysisTaskStatusCompleted            AnalysisTaskStatus = "COMPLETED"
	AnalysisTaskStatusFailed               AnalysisTaskStatus = "FAILED"
	AnalysisTaskStatusPendingInterpretation AnalysisTaskStatus = "PENDING_INTERPRETATION"
)

// IsValid checks if the status is valid
func (s AnalysisTaskStatus) IsValid() bool {
	switch s {
	case AnalysisTaskStatusQueued, AnalysisTaskStatusRunning, AnalysisTaskStatusCompleted,
		AnalysisTaskStatusFailed, AnalysisTaskStatusPendingInterpretation:
		return true
	}
	return false
}

// AnalysisTask represents an analysis task in the Somatic system
type AnalysisTask struct {
	ID                uuid.UUID          `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name              string             `gorm:"type:varchar(255);not null" json:"name"`
	SampleID          uuid.UUID          `gorm:"type:uuid;not null;index" json:"sampleId"`
	PipelineID        *uuid.UUID         `gorm:"type:uuid;index" json:"pipelineId"`
	PipelineVersion   string             `gorm:"type:varchar(50)" json:"pipelineVersion"`
	Status            AnalysisTaskStatus `gorm:"type:varchar(30);not null;default:'QUEUED'" json:"status"`
	InputDataPath     string             `gorm:"type:text" json:"inputDataPath"`
	OutputParquetPath string             `gorm:"type:text" json:"outputParquetPath"`
	CreatedBy         uuid.UUID          `gorm:"type:uuid;not null" json:"createdBy"`
	CreatedAt         time.Time          `gorm:"autoCreateTime" json:"createdAt"`
	StartedAt         *time.Time         `gorm:"-" json:"startedAt"`
	CompletedAt       *time.Time         `gorm:"-" json:"completedAt"`
	ErrorMessage      string             `gorm:"type:text" json:"errorMessage"`
	DeletedAt         gorm.DeletedAt     `gorm:"index" json:"-"`

	// Relationships
	Sample       *Sample        `gorm:"foreignKey:SampleID" json:"-"`
	Pipeline     *Pipeline      `gorm:"foreignKey:PipelineID" json:"-"`
	ResultFiles  []ResultFile   `gorm:"foreignKey:TaskID" json:"-"`
}

// TableName returns the table name for AnalysisTask
func (AnalysisTask) TableName() string {
	return "analysis_tasks"
}

// BeforeCreate hook to generate UUID if not set
func (a *AnalysisTask) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}
