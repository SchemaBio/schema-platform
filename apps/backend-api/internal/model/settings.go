package model

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// JSON is a custom type for storing JSON data in JSONB columns
type JSON map[string]interface{}

// Value implements the driver.Valuer interface
func (j JSON) Value() (driver.Value, error) {
	if j == nil {
		return "{}", nil
	}
	return json.Marshal(j)
}

// Scan implements the sql.Scanner interface
func (j *JSON) Scan(value interface{}) error {
	if value == nil {
		*j = make(map[string]interface{})
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, j)
}

// UserSettings represents user-specific settings
type UserSettings struct {
	ID                   uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID               uuid.UUID `gorm:"type:uuid;uniqueIndex;not null" json:"userId"`
	DisplaySettings      JSON      `gorm:"type:jsonb;default:'{}'" json:"displaySettings"`
	NotificationSettings JSON      `gorm:"type:jsonb;default:'{}'" json:"notificationSettings"`
	AnalysisSettings     JSON      `gorm:"type:jsonb;default:'{}'" json:"analysisSettings"`
	UpdatedAt            time.Time `gorm:"autoUpdateTime" json:"updatedAt"`

	// Relationships
	User *User `gorm:"foreignKey:UserID" json:"-"`
}

// TableName returns the table name for UserSettings
func (UserSettings) TableName() string {
	return "user_settings"
}

// BeforeCreate hook to generate UUID if not set
func (us *UserSettings) BeforeCreate(tx *gorm.DB) error {
	if us.ID == uuid.Nil {
		us.ID = uuid.New()
	}
	return nil
}

// DefaultDisplaySettings returns the default display settings
func DefaultDisplaySettings() JSON {
	return JSON{
		"theme":         "light",
		"language":      "zh-CN",
		"tablePageSize": 20,
	}
}

// DefaultNotificationSettings returns the default notification settings
func DefaultNotificationSettings() JSON {
	return JSON{
		"emailEnabled": true,
		"pushEnabled":  false,
	}
}

// DefaultAnalysisSettings returns the default analysis settings
func DefaultAnalysisSettings() JSON {
	return JSON{
		"defaultFilter": "all",
		"autoRefresh":   true,
	}
}

// SystemConfig represents system-wide configuration
type SystemConfig struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Key       string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"key"`
	Value     JSON      `gorm:"type:jsonb;not null" json:"value"`
	Version   int       `gorm:"default:1" json:"version"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

// TableName returns the table name for SystemConfig
func (SystemConfig) TableName() string {
	return "system_config"
}

// BeforeCreate hook to generate UUID if not set
func (sc *SystemConfig) BeforeCreate(tx *gorm.DB) error {
	if sc.ID == uuid.Nil {
		sc.ID = uuid.New()
	}
	return nil
}

// BeforeUpdate hook to increment version
func (sc *SystemConfig) BeforeUpdate(tx *gorm.DB) error {
	sc.Version++
	return nil
}
