package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// PedigreeRepository handles database operations for pedigrees
type PedigreeRepository struct {
	db *gorm.DB
}

// NewPedigreeRepository creates a new PedigreeRepository
func NewPedigreeRepository(db *gorm.DB) *PedigreeRepository {
	return &PedigreeRepository{db: db}
}

// Create creates a new pedigree
func (r *PedigreeRepository) Create(ctx context.Context, pedigree *model.Pedigree) error {
	return r.db.WithContext(ctx).Create(pedigree).Error
}

// GetByID retrieves a pedigree by ID
func (r *PedigreeRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Pedigree, error) {
	var pedigree model.Pedigree
	err := r.db.WithContext(ctx).
		Preload("Members").
		First(&pedigree, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &pedigree, nil
}

// GetByName retrieves a pedigree by name
func (r *PedigreeRepository) GetByName(ctx context.Context, name string) (*model.Pedigree, error) {
	var pedigree model.Pedigree
	err := r.db.WithContext(ctx).
		Preload("Members").
		First(&pedigree, "name = ?", name).Error
	if err != nil {
		return nil, err
	}
	return &pedigree, nil
}

// ExistsByName checks if a pedigree with the given name exists
func (r *PedigreeRepository) ExistsByName(ctx context.Context, name string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&model.Pedigree{}).
		Where("name = ?", name).
		Count(&count).Error
	return count > 0, err
}

// List retrieves all pedigrees
func (r *PedigreeRepository) List(ctx context.Context, limit, offset int) ([]model.Pedigree, int64, error) {
	var pedigrees []model.Pedigree
	var total int64

	r.db.WithContext(ctx).Model(&model.Pedigree{}).Count(&total)

	err := r.db.WithContext(ctx).
		Preload("Members").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&pedigrees).Error

	return pedigrees, total, err
}

// Update updates a pedigree
func (r *PedigreeRepository) Update(ctx context.Context, pedigree *model.Pedigree) error {
	return r.db.WithContext(ctx).Save(pedigree).Error
}

// Delete soft deletes a pedigree
func (r *PedigreeRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&model.Pedigree{}, "id = ?", id).Error
}

// PedigreeMemberRepository handles database operations for pedigree members
type PedigreeMemberRepository struct {
	db *gorm.DB
}

// NewPedigreeMemberRepository creates a new PedigreeMemberRepository
func NewPedigreeMemberRepository(db *gorm.DB) *PedigreeMemberRepository {
	return &PedigreeMemberRepository{db: db}
}

// Create creates a new pedigree member
func (r *PedigreeMemberRepository) Create(ctx context.Context, member *model.PedigreeMember) error {
	return r.db.WithContext(ctx).Create(member).Error
}

// GetByID retrieves a pedigree member by ID
func (r *PedigreeMemberRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.PedigreeMember, error) {
	var member model.PedigreeMember
	err := r.db.WithContext(ctx).
		Preload("Sample").
		First(&member, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

// GetByPedigreeID retrieves all members of a pedigree
func (r *PedigreeMemberRepository) GetByPedigreeID(ctx context.Context, pedigreeID uuid.UUID) ([]model.PedigreeMember, error) {
	var members []model.PedigreeMember
	err := r.db.WithContext(ctx).
		Preload("Sample").
		Order("generation, position").
		Find(&members, "pedigree_id = ?", pedigreeID).Error
	return members, err
}

// GetBySampleID retrieves a pedigree member by sample ID
func (r *PedigreeMemberRepository) GetBySampleID(ctx context.Context, sampleID uuid.UUID) (*model.PedigreeMember, error) {
	var member model.PedigreeMember
	err := r.db.WithContext(ctx).
		Preload("Pedigree").
		First(&member, "sample_id = ?", sampleID).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

// Update updates a pedigree member
func (r *PedigreeMemberRepository) Update(ctx context.Context, member *model.PedigreeMember) error {
	return r.db.WithContext(ctx).Save(member).Error
}

// Delete soft deletes a pedigree member
func (r *PedigreeMemberRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&model.PedigreeMember{}, "id = ?", id).Error
}

// GetProbandMember returns the proband (index case) of a pedigree
func (r *PedigreeMemberRepository) GetProbandMember(ctx context.Context, pedigreeID uuid.UUID) (*model.PedigreeMember, error) {
	var member model.PedigreeMember
	err := r.db.WithContext(ctx).
		First(&member, "pedigree_id = ? AND relation = ?", pedigreeID, model.RelationProband).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}
