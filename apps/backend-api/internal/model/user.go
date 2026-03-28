package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID           uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email        string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	Name         string         `gorm:"type:varchar(255);not null" json:"name"`
	PasswordHash string         `gorm:"type:varchar(255);not null" json:"-"`
	SystemRole   SystemRole     `gorm:"type:varchar(20);not null;default:'USER'" json:"systemRole"`
	PrimaryOrgID *uuid.UUID     `gorm:"type:uuid;index" json:"primaryOrgId"`
	IsActive     bool           `gorm:"default:true" json:"isActive"`
	CreatedAt    time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	OrgMemberships []OrgMember   `gorm:"foreignKey:UserID" json:"-"`
	PrimaryOrg     *Organization `gorm:"foreignKey:PrimaryOrgID" json:"-"`
	Settings       *UserSettings `gorm:"foreignKey:UserID" json:"-"`
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

// IsSuperAdmin checks if the user is a system super admin
func (u *User) IsSuperAdmin() bool {
	return u.SystemRole == SystemRoleSuperAdmin
}
