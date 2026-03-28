package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// GeneListCategory defines the category of a gene list
type GeneListCategory string

const (
	GeneListCategoryCore     GeneListCategory = "core"
	GeneListCategoryImportant GeneListCategory = "important"
	GeneListCategoryOptional GeneListCategory = "optional"
)

// GeneList represents a list of genes for analysis
type GeneList struct {
	ID              uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	OrgID           uuid.UUID      `gorm:"type:uuid;not null;index" json:"orgId"`
	Name            string         `gorm:"size:100;not null" json:"name"`
	Description     string         `gorm:"type:text" json:"description"`
	Genes           datatypes.JSON `gorm:"type:jsonb" json:"genes"` // Array of gene symbols
	Category        GeneListCategory `gorm:"size:50" json:"category"`
	DiseaseCategory string         `gorm:"size:100" json:"diseaseCategory"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Org *Organization `gorm:"foreignKey:OrgID" json:"-"`
}

// BeforeCreate sets the UUID for new GeneList
func (gl *GeneList) BeforeCreate(tx *gorm.DB) error {
	if gl.ID == uuid.Nil {
		gl.ID = uuid.New()
	}
	return nil
}
