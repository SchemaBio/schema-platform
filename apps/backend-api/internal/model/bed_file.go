package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// BEDFile represents a BED file (target region file) in the system
type BEDFile struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name         string    `gorm:"type:varchar(100);not null" json:"name"`
	Description  string    `gorm:"type:text" json:"description"`
	FilePath     string    `gorm:"type:varchar(255)" json:"filePath"`
	TargetSizeBP int64     `gorm:"type:bigint" json:"targetSizeBp"`
	PanelVersion string    `gorm:"type:varchar(50)" json:"panelVersion"`
	GeneCount    int       `gorm:"type:int" json:"geneCount"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

// TableName returns the table name for BEDFile
func (BEDFile) TableName() string {
	return "bed_files"
}

// BeforeCreate hook to generate UUID if not set
func (b *BEDFile) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}
