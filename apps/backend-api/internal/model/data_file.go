package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DataFileType represents the type of sequencing data file
type DataFileType string

const (
	DataFileTypeFastq   DataFileType = "fastq"
	DataFileTypeFastqGz DataFileType = "fastq.gz"
	DataFileTypeBAM     DataFileType = "bam"
	DataFileTypeUBAM    DataFileType = "ubam"
	DataFileTypeCRAM    DataFileType = "cram"
)

// IsValid checks if the file type is valid
func (t DataFileType) IsValid() bool {
	switch t {
	case DataFileTypeFastq, DataFileTypeFastqGz, DataFileTypeBAM, DataFileTypeUBAM, DataFileTypeCRAM:
		return true
	}
	return false
}

// ReadType represents the read type
type ReadType string

const (
	ReadTypeR1 ReadType = "R1"
	ReadTypeR2 ReadType = "R2"
	ReadTypeSE ReadType = "SE"
)

// IsValid checks if the read type is valid
func (t ReadType) IsValid() bool {
	switch t {
	case ReadTypeR1, ReadTypeR2, ReadTypeSE:
		return true
	}
	return false
}

// DataFileStatus represents the status of a data file
type DataFileStatus string

const (
	DataFileStatusPending   DataFileStatus = "pending"
	DataFileStatusImported  DataFileStatus = "imported"
	DataFileStatusArchived  DataFileStatus = "archived"
	DataFileStatusDeleted   DataFileStatus = "deleted"
)

// IsValid checks if the status is valid
func (s DataFileStatus) IsValid() bool {
	switch s {
	case DataFileStatusPending, DataFileStatusImported, DataFileStatusArchived, DataFileStatusDeleted:
		return true
	}
	return false
}

// DataFile represents a raw sequencing data file in the system
type DataFile struct {
	ID         uuid.UUID     `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	SampleID   *uuid.UUID    `gorm:"type:uuid;index" json:"sampleId"`
	RunID      *uuid.UUID    `gorm:"type:uuid;index" json:"runId"`
	Lane       string        `gorm:"type:varchar(10)" json:"lane"`
	FileName   string        `gorm:"type:varchar(255);not null" json:"fileName"`
	FilePath   string        `gorm:"type:text" json:"filePath"`
	FileSize   int64         `gorm:"type:bigint" json:"fileSize"`
	FileType   DataFileType  `gorm:"type:varchar(20);not null" json:"fileType"`
	ReadType   ReadType      `gorm:"type:varchar(10)" json:"readType"`
	MD5Hash    string        `gorm:"type:varchar(32)" json:"md5Hash"`
	Status     DataFileStatus `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`
	ImportedAt *time.Time    `gorm:"-" json:"importedAt"`
	CreatedAt  time.Time     `gorm:"autoCreateTime" json:"createdAt"`

	// Relationships
	Sample *Sample         `gorm:"foreignKey:SampleID" json:"-"`
	Run    *SequencingRun  `gorm:"foreignKey:RunID" json:"-"`
}

// TableName returns the table name for DataFile
func (DataFile) TableName() string {
	return "data_files"
}

// BeforeCreate hook to generate UUID if not set
func (d *DataFile) BeforeCreate(tx *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	return nil
}
