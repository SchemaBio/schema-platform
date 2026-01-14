package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// BaselineType represents the type of baseline file
type BaselineType string

const (
	BaselineTypeCNV  BaselineType = "cnv"
	BaselineTypeMSI  BaselineType = "msi"
	BaselineTypeOther BaselineType = "other"
)

// IsValid checks if the baseline type is valid
func (t BaselineType) IsValid() bool {
	switch t {
	case BaselineTypeCNV, BaselineTypeMSI, BaselineTypeOther:
		return true
	}
	return false
}

// BaselineFile represents a baseline file for CNV/MSI analysis
type BaselineFile struct {
	ID          uuid.UUID    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string       `gorm:"type:varchar(100);not null" json:"name"`
	BaselineType BaselineType `gorm:"type:varchar(20);not null" json:"baselineType"`
	FilePath    string       `gorm:"type:varchar(255)" json:"filePath"`
	Version     string       `gorm:"type:varchar(20)" json:"version"`
	Description string       `gorm:"type:text" json:"description"`
	CreatedAt   time.Time    `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time    `gorm:"autoUpdateTime" json:"updatedAt"`
}

// TableName returns the table name for BaselineFile
func (BaselineFile) TableName() string {
	return "baseline_files"
}

// BeforeCreate hook to generate UUID if not set
func (b *BaselineFile) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}
