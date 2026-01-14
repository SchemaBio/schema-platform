package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"github.com/schema-platform/backend-api/internal/repository"
	"github.com/schema-platform/backend-api/pkg/errors"
	"gorm.io/datatypes"
)

// GeneListService handles gene list operations
type GeneListService struct {
	geneListRepo *repository.GeneListRepository
}

// NewGeneListService creates a new gene list service
func NewGeneListService(geneListRepo *repository.GeneListRepository) *GeneListService {
	return &GeneListService{
		geneListRepo: geneListRepo,
	}
}

// CreateGeneList creates a new gene list
func (s *GeneListService) CreateGeneList(ctx context.Context, req *dto.GeneListCreateRequest) (*dto.GeneListResponse, error) {
	// Check if name exists
	exists, err := s.geneListRepo.ExistsByName(ctx, req.Name)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}
	if exists {
		return nil, errors.NewConflictError("Gene list name already exists")
	}

	category := model.GeneListCategoryOptional
	if req.Category != "" {
		category = model.GeneListCategory(req.Category)
	}

	geneList := &model.GeneList{
		Name:            req.Name,
		Description:     req.Description,
		Genes:           req.Genes,
		Category:        category,
		DiseaseCategory: req.DiseaseCategory,
	}

	if err := s.geneListRepo.Create(ctx, geneList); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toResponse(geneList), nil
}

// GetGeneList retrieves a gene list by ID
func (s *GeneListService) GetGeneList(ctx context.Context, id string) (*dto.GeneListDetailResponse, error) {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.NewValidationError("Invalid gene list ID")
	}

	geneList, err := s.geneListRepo.GetByID(ctx, uuid)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toDetailResponse(geneList), nil
}

// ListGeneLists lists all gene lists
func (s *GeneListService) ListGeneLists(ctx context.Context, page, pageSize int, category string) (*dto.PaginatedResponse[dto.GeneListResponse], error) {
	offset := (page - 1) * pageSize

	var geneLists []model.GeneList
	var total int64
	var err error

	if category != "" {
		geneLists, total, err = s.geneListRepo.ListByCategory(ctx, model.GeneListCategory(category), pageSize, offset)
	} else {
		geneLists, total, err = s.geneListRepo.List(ctx, pageSize, offset)
	}

	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.GeneListResponse, len(geneLists))
	for i, gl := range geneLists {
		items[i] = *s.toResponse(&gl)
	}

	return dto.NewPaginatedResponse(items, total, page, pageSize), nil
}

// UpdateGeneList updates a gene list
func (s *GeneListService) UpdateGeneList(ctx context.Context, id string, req *dto.GeneListUpdateRequest) (*dto.GeneListResponse, error) {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.NewValidationError("Invalid gene list ID")
	}

	geneList, err := s.geneListRepo.GetByID(ctx, uuid)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	if req.Name != nil && *req.Name != geneList.Name {
		exists, err := s.geneListRepo.ExistsByName(ctx, *req.Name)
		if err != nil {
			return nil, errors.WrapDatabaseError(err)
		}
		if exists {
			return nil, errors.NewConflictError("Gene list name already exists")
		}
		geneList.Name = *req.Name
	}

	if req.Description != nil {
		geneList.Description = *req.Description
	}
	if req.Genes != nil {
		geneList.Genes = *req.Genes
	}
	if req.Category != nil {
		geneList.Category = model.GeneListCategory(*req.Category)
	}
	if req.DiseaseCategory != nil {
		geneList.DiseaseCategory = *req.DiseaseCategory
	}

	if err := s.geneListRepo.Update(ctx, geneList); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toResponse(geneList), nil
}

// DeleteGeneList deletes a gene list
func (s *GeneListService) DeleteGeneList(ctx context.Context, id string) error {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return errors.NewValidationError("Invalid gene list ID")
	}

	return s.geneListRepo.Delete(ctx, uuid)
}

// SearchByGene searches for gene lists containing a specific gene
func (s *GeneListService) SearchByGene(ctx context.Context, geneSymbol string, page, pageSize int) (*dto.PaginatedResponse[dto.GeneListResponse], error) {
	offset := (page - 1) * pageSize

	geneLists, total, err := s.geneListRepo.SearchByGene(ctx, geneSymbol, pageSize, offset)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.GeneListResponse, len(geneLists))
	for i, gl := range geneLists {
		items[i] = *s.toResponse(&gl)
	}

	return dto.NewPaginatedResponse(items, total, page, pageSize), nil
}

// GetCategories returns all available categories
func (s *GeneListService) GetCategories(ctx context.Context) []string {
	return []string{
		string(model.GeneListCategoryCore),
		string(model.GeneListCategoryImportant),
		string(model.GeneListCategoryOptional),
	}
}

// toResponse converts a model to DTO
func (s *GeneListService) toResponse(gl *model.GeneList) *dto.GeneListResponse {
	return &dto.GeneListResponse{
		ID:              gl.ID,
		Name:            gl.Name,
		Description:     gl.Description,
		Genes:           gl.Genes,
		GeneCount:       countGenes(gl.Genes),
		Category:        string(gl.Category),
		DiseaseCategory: gl.DiseaseCategory,
		CreatedAt:       gl.CreatedAt,
		UpdatedAt:       gl.UpdatedAt,
	}
}

// toDetailResponse converts a model to detailed DTO
func (s *GeneListService) toDetailResponse(gl *model.GeneList) *dto.GeneListDetailResponse {
	return &dto.GeneListDetailResponse{
		ID:              gl.ID,
		Name:            gl.Name,
		Description:     gl.Description,
		Genes:           gl.Genes,
		GeneCount:       countGenes(gl.Genes),
		Category:        string(gl.Category),
		DiseaseCategory: gl.DiseaseCategory,
		CreatedAt:       gl.CreatedAt,
		UpdatedAt:       gl.UpdatedAt,
	}
}

// countGenes counts the number of genes in a JSON array
func countGenes(genes datatypes.JSON) int {
	// Simple count - in practice, you would parse the JSON
	// For now, return 0 as a placeholder
	return 0
}
