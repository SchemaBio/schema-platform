package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ReportStatus represents the status of a report
type ReportStatus string

const (
	ReportStatusDraft        ReportStatus = "DRAFT"
	ReportStatusPendingReview ReportStatus = "PENDING_REVIEW"
	ReportStatusApproved     ReportStatus = "APPROVED"
	ReportStatusReleased     ReportStatus = "RELEASED"
)

// IsValid checks if the report status is valid
func (s ReportStatus) IsValid() bool {
	switch s {
	case ReportStatusDraft, ReportStatusPendingReview, ReportStatusApproved, ReportStatusReleased:
		return true
	}
	return false
}

// CanTransitionTo checks if the status can transition to the target status
func (s ReportStatus) CanTransitionTo(target ReportStatus) bool {
	switch s {
	case ReportStatusDraft:
		return target == ReportStatusPendingReview
	case ReportStatusPendingReview:
		return target == ReportStatusApproved || target == ReportStatusDraft
	case ReportStatusApproved:
		return target == ReportStatusReleased || target == ReportStatusPendingReview
	case ReportStatusReleased:
		return false // Released reports cannot be changed
	}
	return false
}

// Report represents a generated report in the system
type Report struct {
	ID          uuid.UUID    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OrgID       uuid.UUID    `gorm:"type:uuid;not null;index" json:"orgId"`
	TaskID      uuid.UUID    `gorm:"type:uuid;not null;index" json:"taskId"`
	TemplateID  *uuid.UUID   `gorm:"type:uuid;index" json:"templateId"`
	Title       string       `gorm:"type:varchar(255);not null" json:"title"`
	Status      ReportStatus `gorm:"type:varchar(20);not null;default:'DRAFT'" json:"status"`
	FilePath    string       `gorm:"type:varchar(500)" json:"filePath"`
	FileName    string       `gorm:"type:varchar(255)" json:"fileName"`
	FileType    string       `gorm:"type:varchar(20)" json:"fileType"` // pdf, docx, etc.
	ReportType  string       `gorm:"type:varchar(20)" json:"reportType"` // generated, uploaded
	CreatedBy   uuid.UUID    `gorm:"type:uuid;not null" json:"createdBy"`
	ReviewedBy  *uuid.UUID   `gorm:"type:uuid" json:"reviewedBy"`
	ApprovedBy  *uuid.UUID   `gorm:"type:uuid" json:"approvedBy"`
	ReleasedBy  *uuid.UUID   `gorm:"type:uuid" json:"releasedBy"`
	ReviewedAt  *time.Time   `gorm:"type:timestamp" json:"reviewedAt"`
	ApprovedAt  *time.Time   `gorm:"type:timestamp" json:"approvedAt"`
	ReleasedAt  *time.Time   `gorm:"type:timestamp" json:"releasedAt"`
	CreatedAt   time.Time    `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time    `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Org        *Organization   `gorm:"foreignKey:OrgID" json:"-"`
	Task       *AnalysisTask   `gorm:"foreignKey:TaskID" json:"task"`
	Template   *ReportTemplate `gorm:"foreignKey:TemplateID" json:"template"`
	Creator    *User           `gorm:"foreignKey:CreatedBy" json:"creator"`
	Reviewer   *User           `gorm:"foreignKey:ReviewedBy" json:"reviewer"`
	Approver   *User           `gorm:"foreignKey:ApprovedBy" json:"approver"`
	Releaser   *User           `gorm:"foreignKey:ReleasedBy" json:"releaser"`
}

// TableName returns the table name for Report
func (Report) TableName() string {
	return "reports"
}

// BeforeCreate hook to generate UUID if not set
func (r *Report) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

// ReportTemplate represents a report template
type ReportTemplate struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OrgID       uuid.UUID `gorm:"type:uuid;not null;index" json:"orgId"`
	Name        string    `gorm:"type:varchar(255);not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	TemplatePath string   `gorm:"type:varchar(500)" json:"templatePath"`
	IsActive    bool      `gorm:"default:true" json:"isActive"`
	CreatedBy   uuid.UUID `gorm:"type:uuid;not null" json:"createdBy"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Org     *Organization `gorm:"foreignKey:OrgID" json:"-"`
	Creator *User         `gorm:"foreignKey:CreatedBy" json:"-"`
}

// TableName returns the table name for ReportTemplate
func (ReportTemplate) TableName() string {
	return "report_templates"
}

// BeforeCreate hook to generate UUID if not set
func (t *ReportTemplate) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}