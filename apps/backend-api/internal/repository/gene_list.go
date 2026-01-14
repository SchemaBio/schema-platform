package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/gorm"
)

// GeneListRepository handles database operations for gene lists
type GeneListRepository struct {
	db *gorm.DB
}

// NewGeneListRepository creates a new GeneListRepository
func NewGeneListRepository(db *gorm.DB) *GeneListRepository {
	return &GeneListRepository{db: db}
}

// Create creates a new gene list
func (r *GeneListRepository) Create(ctx context.Context, geneList *model.GeneList) error {
	return r.db.WithContext(ctx).Create(geneList).Error
}

// GetByID retrieves a gene list by ID
func (r *GeneListRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.GeneList, error) {
	var geneList model.GeneList
	err := r.db.WithContext(ctx).First(&geneList, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &geneList, nil
}

// GetByName retrieves a gene list by name
func (r *GeneListRepository) GetByName(ctx context.Context, name string) (*model.GeneList, error) {
	var geneList model.GeneList
	err := r.db.WithContext(ctx).First(&geneList, "name = ?", name).Error
	if err != nil {
		return nil, err
	}
	return &geneList, nil
}

// ExistsByName checks if a gene list with the given name exists
func (r *GeneListRepository) ExistsByName(ctx context.Context, name string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&model.GeneList{}).
		Where("name = ?", name).
		Count(&count).Error
	return count > 0, err
}

// List retrieves all gene lists
func (r *GeneListRepository) List(ctx context.Context, limit, offset int) ([]model.GeneList, int64, error) {
	var geneLists []model.GeneList
	var total int64

	r.db.WithContext(ctx).Model(&model.GeneList{}).Count(&total)

	err := r.db.WithContext(ctx).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&geneLists).Error

	return geneLists, total, err
}

// ListByCategory retrieves gene lists by category
func (r *GeneListRepository) ListByCategory(ctx context.Context, category model.GeneListCategory, limit, offset int) ([]model.GeneList, int64, error) {
	var geneLists []model.GeneList
	var total int64

	query := r.db.WithContext(ctx).Model(&model.GeneList{}).Where("category = ?", category)
	query.Count(&total)

	err := query.Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&geneLists).Error

	return geneLists, total, err
}

// Update updates a gene list
func (r *GeneListRepository) Update(ctx context.Context, geneList *model.GeneList) error {
	return r.db.WithContext(ctx).Save(geneList).Error
}

// Delete soft deletes a gene list
func (r *GeneListRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&model.GeneList{}, "id = ?", id).Error
}

// SearchByGene searches for gene lists containing a specific gene
func (r *GeneListRepository) SearchByGene(ctx context.Context, geneSymbol string, limit, offset int) ([]model.GeneList, int64, error) {
	var geneLists []model.GeneList
	var total int64

	// Using PostgreSQL JSONB contains operator
	query := r.db.WithContext(ctx).Model(&model.GeneList{}).
		Where("genes @> ?", `["`+geneSymbol+`"]`)

	query.Count(&total)

	err := query.Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&geneLists).Error

	return geneLists, total, err
}
