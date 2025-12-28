package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Team represents a team in the system
type Team struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	OwnerID     uuid.UUID `gorm:"type:uuid;not null" json:"ownerId"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updatedAt"`

	// Relationships
	Owner   *User        `gorm:"foreignKey:OwnerID" json:"-"`
	Members []TeamMember `gorm:"foreignKey:TeamID" json:"-"`
}

// TableName returns the table name for Team
func (Team) TableName() string {
	return "teams"
}

// BeforeCreate hook to generate UUID if not set
func (t *Team) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

// TeamMember represents a user's membership in a team
type TeamMember struct {
	ID       uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID   uuid.UUID `gorm:"type:uuid;not null;index" json:"userId"`
	TeamID   uuid.UUID `gorm:"type:uuid;not null;index" json:"teamId"`
	Role     UserRole  `gorm:"type:varchar(20);not null;default:'VIEWER'" json:"role"`
	JoinedAt time.Time `gorm:"autoCreateTime" json:"joinedAt"`

	// Relationships
	User *User `gorm:"foreignKey:UserID" json:"-"`
	Team *Team `gorm:"foreignKey:TeamID" json:"-"`
}

// TableName returns the table name for TeamMember
func (TeamMember) TableName() string {
	return "team_members"
}

// BeforeCreate hook to generate UUID if not set
func (tm *TeamMember) BeforeCreate(tx *gorm.DB) error {
	if tm.ID == uuid.Nil {
		tm.ID = uuid.New()
	}
	return nil
}
