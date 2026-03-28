package model

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// OrgStatus represents the status of an organization
type OrgStatus string

const (
	OrgStatusActive    OrgStatus = "ACTIVE"
	OrgStatusSuspended OrgStatus = "SUSPENDED"
)

// IsValid checks if the status is valid
func (s OrgStatus) IsValid() bool {
	return s == OrgStatusActive || s == OrgStatusSuspended
}

// OrgPlan represents the subscription plan of an organization
type OrgPlan string

const (
	OrgPlanSelfHosted OrgPlan = "SELF_HOSTED" // For open-source deployments
	OrgPlanFree       OrgPlan = "FREE"        // Free tier for SaaS
	OrgPlanPro        OrgPlan = "PRO"         // Professional tier
	OrgPlanEnterprise OrgPlan = "ENTERPRISE"  // Enterprise tier
)

// IsValid checks if the plan is valid
func (p OrgPlan) IsValid() bool {
	switch p {
	case OrgPlanSelfHosted, OrgPlanFree, OrgPlanPro, OrgPlanEnterprise:
		return true
	}
	return false
}

// OrgRole represents the role of a user within an organization
type OrgRole string

const (
	OrgRoleOwner   OrgRole = "OWNER"   // Organization owner (full control)
	OrgRoleAdmin   OrgRole = "ADMIN"   // Organization admin
	OrgRoleDoctor  OrgRole = "DOCTOR"  // Doctor
	OrgRoleAnalyst OrgRole = "ANALYST" // Analyst
	OrgRoleViewer  OrgRole = "VIEWER"  // Viewer
)

// IsValid checks if the org role is valid
func (r OrgRole) IsValid() bool {
	switch r {
	case OrgRoleOwner, OrgRoleAdmin, OrgRoleDoctor, OrgRoleAnalyst, OrgRoleViewer:
		return true
	}
	return false
}

// SystemRole represents the system-level role of a user
type SystemRole string

const (
	SystemRoleSuperAdmin SystemRole = "SUPER_ADMIN" // Platform super admin
	SystemRoleUser       SystemRole = "USER"        // Regular user
)

// IsValid checks if the system role is valid
func (r SystemRole) IsValid() bool {
	return r == SystemRoleSuperAdmin || r == SystemRoleUser
}

// OrgSettings is a custom JSONB type for organization settings
type OrgSettings map[string]interface{}

// Value implements the driver.Valuer interface
func (s OrgSettings) Value() (driver.Value, error) {
	if s == nil {
		return "{}", nil
	}
	return json.Marshal(s)
}

// Scan implements the sql.Scanner interface
func (s *OrgSettings) Scan(value interface{}) error {
	if value == nil {
		*s = OrgSettings{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, s)
}

// Organization represents an organization/tenant in the system
type Organization struct {
	ID          uuid.UUID   `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string      `gorm:"type:varchar(255);not null" json:"name"`
	Slug        string      `gorm:"type:varchar(100);uniqueIndex;not null" json:"slug"`
	Description string      `gorm:"type:text" json:"description"`
	Settings    OrgSettings `gorm:"type:jsonb;default:'{}'" json:"settings"`
	Status      OrgStatus   `gorm:"type:varchar(20);not null;default:'ACTIVE'" json:"status"`
	Plan        OrgPlan     `gorm:"type:varchar(20);not null;default:'SELF_HOSTED'" json:"plan"`
	MaxUsers    int         `gorm:"type:int;default:-1" json:"maxUsers"` // -1 means unlimited
	CreatedAt   time.Time   `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time   `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Members []OrgMember `gorm:"foreignKey:OrgID" json:"-"`
}

// TableName returns the table name for Organization
func (Organization) TableName() string {
	return "organizations"
}

// BeforeCreate hook to generate UUID if not set
func (o *Organization) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}

// OrgMember represents a user's membership in an organization
type OrgMember struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:org_member_user_org" json:"userId"`
	OrgID     uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:org_member_user_org;index" json:"orgId"`
	OrgRole   OrgRole   `gorm:"type:varchar(20);not null;default:'VIEWER'" json:"orgRole"`
	JoinedAt  time.Time `gorm:"autoCreateTime" json:"joinedAt"`
	InvitedBy uuid.UUID `gorm:"type:uuid" json:"invitedBy"`

	// Relationships
	User *User         `gorm:"foreignKey:UserID" json:"-"`
	Org  *Organization `gorm:"foreignKey:OrgID" json:"-"`
}

// TableName returns the table name for OrgMember
func (OrgMember) TableName() string {
	return "org_members"
}

// BeforeCreate hook to generate UUID if not set
func (om *OrgMember) BeforeCreate(tx *gorm.DB) error {
	if om.ID == uuid.Nil {
		om.ID = uuid.New()
	}
	return nil
}