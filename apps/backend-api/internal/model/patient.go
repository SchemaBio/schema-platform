package model

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Gender represents the gender of a patient
type Gender string

const (
	GenderMale    Gender = "MALE"
	GenderFemale  Gender = "FEMALE"
	GenderUnknown Gender = "UNKNOWN"
)

// IsValid checks if the gender is valid
func (g Gender) IsValid() bool {
	switch g {
	case GenderMale, GenderFemale, GenderUnknown:
		return true
	}
	return false
}

// StringArray is a custom type for storing string arrays in JSONB
type StringArray []string

// Value implements the driver.Valuer interface
func (s StringArray) Value() (driver.Value, error) {
	if s == nil {
		return "[]", nil
	}
	return json.Marshal(s)
}

// Scan implements the sql.Scanner interface
func (s *StringArray) Scan(value interface{}) error {
	if value == nil {
		*s = []string{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, s)
}

// Patient represents a patient in the system
type Patient struct {
	ID         uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name       string         `gorm:"type:varchar(255);not null" json:"name"`
	Gender     Gender         `gorm:"type:varchar(10);not null;default:'UNKNOWN'" json:"gender"`
	BirthDate  *time.Time     `gorm:"type:date" json:"birthDate"`
	Phenotypes StringArray    `gorm:"type:jsonb;default:'[]'" json:"phenotypes"`
	CreatedBy  uuid.UUID      `gorm:"type:uuid;not null" json:"createdBy"`
	CreatedAt  time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt  time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Samples []Sample `gorm:"foreignKey:PatientID" json:"-"`
	Creator *User    `gorm:"foreignKey:CreatedBy" json:"-"`
}

// TableName returns the table name for Patient
func (Patient) TableName() string {
	return "patients"
}

// BeforeCreate hook to generate UUID if not set
func (p *Patient) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
