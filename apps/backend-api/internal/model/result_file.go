package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ResultType represents the type of analysis result
type ResultType string

const (
	ResultTypeSNVIndel    ResultType = "snv_indel"
	ResultTypeCNVSegment  ResultType = "cnv_segment"
	ResultTypeCNVExon     ResultType = "cnv_exon"
	ResultTypeCNVChrom    ResultType = "cnv_chrom"
	ResultTypeFusion      ResultType = "fusion"
	ResultTypeHotspot     ResultType = "hotspot"
	ResultTypeGermline    ResultType = "germline"
	ResultTypeChemotherapy ResultType = "chemotherapy"
	ResultTypeMitochondrial ResultType = "mitochondrial"
	ResultTypeSTR         ResultType = "str"
	ResultTypeUPD         ResultType = "upd"
	ResultTypeNeoantigen  ResultType = "neoantigen"
	ResultTypeBiomarker   ResultType = "biomarker"
	ResultTypeQC          ResultType = "qc"
)

// IsValid checks if the result type is valid
func (t ResultType) IsValid() bool {
	switch t {
	case ResultTypeSNVIndel, ResultTypeCNVSegment, ResultTypeCNVExon, ResultTypeCNVChrom,
		ResultTypeFusion, ResultTypeHotspot, ResultTypeGermline, ResultTypeChemotherapy,
		ResultTypeMitochondrial, ResultTypeSTR, ResultTypeUPD, ResultTypeNeoantigen,
		ResultTypeBiomarker, ResultTypeQC:
		return true
	}
	return false
}

// ResultFile represents a Parquet result file reference
type ResultFile struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	TaskID      uuid.UUID `gorm:"type:uuid;not null;index" json:"taskId"`
	ResultType  ResultType `gorm:"type:varchar(50);not null" json:"resultType"`
	FilePath    string    `gorm:"type:text" json:"filePath"`
	FileSize    int64     `gorm:"type:bigint" json:"fileSize"`
	RecordCount int       `gorm:"type:int" json:"recordCount"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"createdAt"`

	// Relationships
	Task *AnalysisTask `gorm:"foreignKey:TaskID" json:"-"`
}

// TableName returns the table name for ResultFile
func (ResultFile) TableName() string {
	return "result_files"
}

// BeforeCreate hook to generate UUID if not set
func (r *ResultFile) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}
