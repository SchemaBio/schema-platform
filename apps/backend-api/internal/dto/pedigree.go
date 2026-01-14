package dto

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// PedigreeCreateRequest represents a request to create a pedigree
type PedigreeCreateRequest struct {
	Name    string `json:"name" binding:"required,min=1,max=100"`
	Disease string `json:"disease" binding:"omitempty,max=255"`
	Note    string `json:"note" binding:"omitempty"`
}

// PedigreeUpdateRequest represents a request to update a pedigree
type PedigreeUpdateRequest struct {
	Name    *string `json:"name" binding:"omitempty,min=1,max=100"`
	Disease *string `json:"disease" binding:"omitempty,max=255"`
	Note    *string `json:"note" binding:"omitempty"`
}

// PedigreeResponse represents a pedigree response
type PedigreeResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Disease     string    `json:"disease,omitempty"`
	MemberCount int       `json:"memberCount"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// PedigreeDetailResponse represents a detailed pedigree response
type PedigreeDetailResponse struct {
	ID              string                    `json:"id"`
	Name            string                    `json:"name"`
	Disease         string                    `json:"disease,omitempty"`
	Note            string                    `json:"note,omitempty"`
	ProbandMemberID *uuid.UUID                `json:"probandMemberId,omitempty"`
	Members         []PedigreeMemberResponse  `json:"members"`
	CreatedAt       time.Time                 `json:"createdAt"`
	UpdatedAt       time.Time                 `json:"updatedAt"`
}

// PedigreeMemberCreateRequest represents a request to create a pedigree member
type PedigreeMemberCreateRequest struct {
	Name           string          `json:"name" binding:"required,min=1,max=100"`
	Gender         string          `json:"gender" binding:"required,oneof=male female unknown"`
	BirthYear      *int            `json:"birthYear,omitempty"`
	IsDeceased     bool            `json:"isDeceased"`
	DeceasedYear   *int            `json:"deceasedYear,omitempty"`
	Relation       string          `json:"relation" binding:"required"`
	AffectedStatus string          `json:"affectedStatus" binding:"required"`
	Phenotypes     datatypes.JSON  `json:"phenotypes,omitempty"`
	FatherID       *uuid.UUID      `json:"fatherId,omitempty"`
	MotherID       *uuid.UUID      `json:"motherId,omitempty"`
	Generation     int             `json:"generation"`
	Position       int             `json:"position"`
	SampleID       *string         `json:"sampleId,omitempty"`
}

// PedigreeMemberUpdateRequest represents a request to update a pedigree member
type PedigreeMemberUpdateRequest struct {
	Name           *string         `json:"name" binding:"omitempty,min=1,max=100"`
	Gender         *string         `json:"gender" binding:"omitempty,oneof=male female unknown"`
	BirthYear      *int            `json:"birthYear,omitempty"`
	IsDeceased     *bool           `json:"isDeceased,omitempty"`
	DeceasedYear   *int            `json:"deceasedYear,omitempty"`
	Relation       *string         `json:"relation,omitempty"`
	AffectedStatus *string         `json:"affectedStatus,omitempty"`
	Phenotypes     *datatypes.JSON `json:"phenotypes,omitempty"`
	FatherID       *uuid.UUID      `json:"fatherId,omitempty"`
	MotherID       *uuid.UUID      `json:"motherId,omitempty"`
	Generation     *int            `json:"generation,omitempty"`
	Position       *int            `json:"position,omitempty"`
	SampleID       *uuid.UUID      `json:"sampleId,omitempty"`
}

// PedigreeMemberResponse represents a pedigree member response
type PedigreeMemberResponse struct {
	ID             string         `json:"id"`
	PedigreeID     string         `json:"pedigreeId"`
	SampleID       *uuid.UUID     `json:"sampleId,omitempty"`
	Name           string         `json:"name"`
	Gender         string         `json:"gender"`
	BirthYear      *int           `json:"birthYear,omitempty"`
	IsDeceased     bool           `json:"isDeceased"`
	DeceasedYear   *int           `json:"deceasedYear,omitempty"`
	Relation       string         `json:"relation"`
	AffectedStatus string         `json:"affectedStatus"`
	Phenotypes     datatypes.JSON `json:"phenotypes,omitempty"`
	FatherID       *uuid.UUID     `json:"fatherId,omitempty"`
	MotherID       *uuid.UUID     `json:"motherId,omitempty"`
	Generation     int            `json:"generation"`
	Position       int            `json:"position"`
	HasSample      bool           `json:"hasSample"`
	CreatedAt      time.Time      `json:"createdAt"`
	UpdatedAt      time.Time      `json:"updatedAt"`
}
