package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// RelationType defines the relationship to the proband
type RelationType string

const (
	RelationProband             RelationType = "proband"
	RelationFather              RelationType = "father"
	RelationMother              RelationType = "mother"
	RelationSibling             RelationType = "sibling"
	RelationChild               RelationType = "child"
	RelationSpouse              RelationType = "spouse"
	RelationGrandfatherPaternal RelationType = "grandfather_paternal"
	RelationGrandmotherPaternal RelationType = "grandmother_paternal"
	RelationGrandfatherMaternal RelationType = "grandfather_maternal"
	RelationGrandmotherMaternal RelationType = "grandmother_maternal"
	RelationUncle               RelationType = "uncle"
	RelationAunt                RelationType = "aunt"
	RelationCousin              RelationType = "cousin"
	RelationOther               RelationType = "other"
)

// AffectedStatus defines the affected status of a family member
type AffectedStatus string

const (
	AffectedStatusAffected    AffectedStatus = "affected"
	AffectedStatusUnaffected  AffectedStatus = "unaffected"
	AffectedStatusUnknown     AffectedStatus = "unknown"
	AffectedStatusCarrier     AffectedStatus = "carrier" // For AR diseases
)

// Pedigree represents a family unit for genetic analysis
type Pedigree struct {
	ID               uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Name             string         `gorm:"size:100;not null" json:"name"`
	Disease          string         `gorm:"size:255" json:"disease"`
	ProbandMemberID  *uuid.UUID     `gorm:"type:uuid" json:"probandMemberId"`
	Note             string         `gorm:"type:text" json:"note"`
	CreatedAt        time.Time      `json:"createdAt"`
	UpdatedAt        time.Time      `json:"updatedAt"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Members []PedigreeMember `gorm:"foreignKey:PedigreeID" json:"members,omitempty"`
}

// PedigreeMember represents a member of a pedigree (may or may not have a sample)
type PedigreeMember struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	PedigreeID     uuid.UUID      `gorm:"type:uuid;not null;index" json:"pedigreeId"`
	SampleID       *uuid.UUID     `gorm:"type:uuid;index" json:"sampleId,omitempty"`
	Name           string         `gorm:"size:100;not null" json:"name"`
	Gender         string         `gorm:"size:20;not null" json:"gender"` // male, female, unknown
	BirthYear      *int           `json:"birthYear,omitempty"`
	IsDeceased     bool           `gorm:"default:false" json:"isDeceased"`
	DeceasedYear   *int           `json:"deceasedYear,omitempty"`
	Relation       RelationType   `gorm:"size:50;not null;index" json:"relation"`
	AffectedStatus AffectedStatus `gorm:"size:20;not null;index" json:"affectedStatus"`
	Phenotypes     datatypes.JSON `json:"phenotypes,omitempty"`
	FatherID       *uuid.UUID     `gorm:"type:uuid;index" json:"fatherId,omitempty"`
	MotherID       *uuid.UUID     `gorm:"type:uuid;index" json:"motherId,omitempty"`
	Generation     int            `json:"generation"` // 0 = proband generation
	Position       int            `json:"position"`   // Position within generation
	CreatedAt      time.Time      `json:"createdAt"`
	UpdatedAt      time.Time      `json:"updatedAt"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Pedigree *Pedigree `gorm:"foreignKey:PedigreeID" json:"-"`
	Sample   *Sample   `gorm:"foreignKey:SampleID" json:"-"`
	Father   *PedigreeMember `gorm:"foreignKey:FatherID" json:"-"`
	Mother   *PedigreeMember `gorm:"foreignKey:MotherID" json:"-"`
	Children []PedigreeMember `gorm:"foreignKey:FatherID" json:"-"`
	ChildrenM []PedigreeMember `gorm:"foreignKey:MotherID" json:"-"`
}

// BeforeCreate sets the UUID for new Pedigree
func (p *Pedigree) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

// BeforeCreate sets the UUID for new PedigreeMember
func (pm *PedigreeMember) BeforeCreate(tx *gorm.DB) error {
	if pm.ID == uuid.Nil {
		pm.ID = uuid.New()
	}
	return nil
}
