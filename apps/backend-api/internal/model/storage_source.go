package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// StorageProtocol represents the storage protocol type
type StorageProtocol string

const (
	StorageProtocolWebDAV StorageProtocol = "webdav"
	StorageProtocolS3     StorageProtocol = "s3"
	StorageProtocolSMB    StorageProtocol = "smb"
)

// IsValid checks if the protocol is valid
func (p StorageProtocol) IsValid() bool {
	switch p {
	case StorageProtocolWebDAV, StorageProtocolS3, StorageProtocolSMB:
		return true
	}
	return false
}

// StorageSource represents a file storage backend configuration
type StorageSource struct {
	ID           uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name         string         `gorm:"type:varchar(100);not null" json:"name"`
	Protocol     StorageProtocol `gorm:"type:varchar(20);not null" json:"protocol"`
	Endpoint     string         `gorm:"type:varchar(500)" json:"endpoint"`
	BasePath     string         `gorm:"type:text" json:"basePath"`
	Credentials  string         `gorm:"type:jsonb" json:"credentials"` // Encrypted credentials
	IsDefault    bool           `gorm:"type:boolean;default:false" json:"isDefault"`
	CreatedAt    time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
}

// TableName returns the table name for StorageSource
func (StorageSource) TableName() string {
	return "storage_sources"
}

// BeforeCreate hook to generate UUID if not set
func (s *StorageSource) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
