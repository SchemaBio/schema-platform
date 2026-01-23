package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// AuditAction represents the type of audit action
type AuditAction string

const (
	AuditActionCreate AuditAction = "CREATE"
	AuditActionUpdate AuditAction = "UPDATE"
	AuditActionDelete AuditAction = "DELETE"
	AuditActionLogin  AuditAction = "LOGIN"
	AuditActionLogout AuditAction = "LOGOUT"
)

// IsValid checks if the action is valid
func (a AuditAction) IsValid() bool {
	switch a {
	case AuditActionCreate, AuditActionUpdate, AuditActionDelete,
		AuditActionLogin, AuditActionLogout:
		return true
	}
	return false
}

// AuditLog represents an audit log entry
type AuditLog struct {
	ID           uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID       uuid.UUID      `gorm:"type:uuid;not null;index" json:"userId"`
	UserEmail    string         `gorm:"type:varchar(255)" json:"userEmail"`
	Action       AuditAction    `gorm:"type:varchar(20);not null;index" json:"action"`
	ResourceType string         `gorm:"type:varchar(50);not null;index" json:"resourceType"`
	ResourceID   *uuid.UUID     `gorm:"type:uuid;index" json:"resourceId"`
	Changes      datatypes.JSON `gorm:"type:jsonb" json:"changes"`
	Metadata     datatypes.JSON `gorm:"type:jsonb" json:"metadata"`
	IPAddress    string         `gorm:"type:varchar(45)" json:"ipAddress"`
	UserAgent    string         `gorm:"type:text" json:"userAgent"`
	RequestID    string         `gorm:"type:varchar(36);index" json:"requestId"`
	CreatedAt    time.Time      `gorm:"autoCreateTime;index" json:"createdAt"`
}

// TableName returns the table name for AuditLog
func (AuditLog) TableName() string {
	return "audit_logs"
}

// BeforeCreate hook to generate UUID if not set
func (a *AuditLog) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

// AuditChanges represents the before/after changes for an update
type AuditChanges struct {
	Before map[string]interface{} `json:"before,omitempty"`
	After  map[string]interface{} `json:"after,omitempty"`
}

// AuditMetadata represents additional metadata for an audit log
type AuditMetadata struct {
	Reason      string `json:"reason,omitempty"`
	Description string `json:"description,omitempty"`
}
