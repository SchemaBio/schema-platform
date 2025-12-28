package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserRole represents the role of a user in the system
type UserRole string

const (
	UserRoleAdmin   UserRole = "ADMIN"
	UserRoleDoctor  UserRole = "DOCTOR"
	UserRoleAnalyst UserRole = "ANALYST"
	UserRoleViewer  UserRole = "VIEWER"
)

// IsValid checks if the role is valid
func (r UserRole) IsValid() bool {
	switch r {
	case UserRoleAdmin, UserRoleDoctor, UserRoleAnalyst, UserRoleViewer:
		return true
	}
	return false
}

// User represents a user in the system
type User struct {
	ID           uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email        string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	Name         string         `gorm:"type:varchar(255);not null" json:"name"`
	PasswordHash string         `gorm:"type:varchar(255);not null" json:"-"`
	Role         UserRole       `gorm:"type:varchar(20);not null;default:'VIEWER'" json:"role"`
	IsActive     bool           `gorm:"default:true" json:"isActive"`
	CreatedAt    time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	TeamMemberships []TeamMember  `gorm:"foreignKey:UserID" json:"-"`
	Settings        *UserSettings `gorm:"foreignKey:UserID" json:"-"`
}

// TableName returns the table name for User
func (User) TableName() string {
	return "users"
}

// BeforeCreate hook to generate UUID if not set
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}
