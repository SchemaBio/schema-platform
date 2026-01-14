package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// BatchStatus represents the status of a batch
type BatchStatus string

const (
	BatchStatusPending    BatchStatus = "PENDING"
	BatchStatusProcessing BatchStatus = "PROCESSING"
	BatchStatusCompleted  BatchStatus = "COMPLETED"
)

// Batch represents a batch of samples processed together
type Batch struct {
	ID          uuid.UUID    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string       `gorm:"type:varchar(255);not null" json:"name"`
	Status      BatchStatus  `gorm:"type:varchar(20);not null;default:'PENDING'" json:"status"`
	CreatedBy   uuid.UUID    `gorm:"type:uuid;not null" json:"createdBy"`
	CreatedAt   time.Time    `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time    `gorm:"autoUpdateTime" json:"updatedAt"`
	CompletedAt *time.Time   `json:"completedAt"`

	// Relationships
	Samples []Sample `gorm:"foreignKey:BatchID" json:"-"`
	Creator *User    `gorm:"foreignKey:CreatedBy" json:"-"`
}

// TableName returns the table name for Batch
func (Batch) TableName() string {
	return "batches"
}

// BeforeCreate hook to generate UUID if not set
func (b *Batch) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}
