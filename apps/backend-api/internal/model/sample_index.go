package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SampleIndex represents a sample index sequence in the system
type SampleIndex struct {
	ID             uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	SampleSheetID  uuid.UUID  `gorm:"type:uuid;not null;index" json:"sampleSheetId"`
	SampleID       *uuid.UUID `gorm:"type:uuid;index" json:"sampleId"`
	Lane           string     `gorm:"type:varchar(10)" json:"lane"`
	Index5         string     `gorm:"type:varchar(20)" json:"index5"`
	Index7         string     `gorm:"type:varchar(20)" json:"index7"`
	ProjectName    string     `gorm:"type:varchar(100)" json:"projectName"`
	Description    string     `gorm:"type:varchar(255)" json:"description"`
	Matched        bool       `gorm:"type:boolean;default:false" json:"matched"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"createdAt"`

	// Relationships
	SampleSheet *SampleSheet `gorm:"foreignKey:SampleSheetID" json:"-"`
	Sample      *Sample      `gorm:"foreignKey:SampleID" json:"-"`
}

// TableName returns the table name for SampleIndex
func (SampleIndex) TableName() string {
	return "sample_indices"
}

// BeforeCreate hook to generate UUID if not set
func (s *SampleIndex) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
