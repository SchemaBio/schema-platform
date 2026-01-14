package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/repository"
	"github.com/schema-platform/backend-api/internal/service"
)

// GeneListHandler handles gene list operations
type GeneListHandler struct {
	geneListService *service.GeneListService
}

// NewGeneListHandler creates a new gene list handler
func NewGeneListHandler(geneListRepo *repository.GeneListRepository) *GeneListHandler {
	return &GeneListHandler{
		geneListService: service.NewGeneListService(geneListRepo),
	}
}

// RegisterRoutes registers gene list routes
func (h *GeneListHandler) RegisterRoutes(r *gin.RouterGroup) {
	geneLists := r.Group("/gene-lists")
	{
		geneLists.POST("", h.CreateGeneList)
		geneLists.GET("", h.ListGeneLists)
		geneLists.GET("/categories", h.GetCategories)
		geneLists.GET("/search", h.SearchByGene)
		geneLists.GET("/:id", h.GetGeneList)
		geneLists.PUT("/:id", h.UpdateGeneList)
		geneLists.DELETE("/:id", h.DeleteGeneList)
	}
}

// CreateGeneList handles POST /api/v1/gene-lists
func (h *GeneListHandler) CreateGeneList(c *gin.Context) {
	var req dto.GeneListCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("INVALID_REQUEST", err.Error(), nil))
		return
	}

	response, err := h.geneListService.CreateGeneList(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("CREATE_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusCreated, dto.SuccessResponse(*response))
}

// GetGeneList handles GET /api/v1/gene-lists/:id
func (h *GeneListHandler) GetGeneList(c *gin.Context) {
	id := c.Param("id")

	response, err := h.geneListService.GetGeneList(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse("NOT_FOUND", err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse(*response))
}

// ListGeneLists handles GET /api/v1/gene-lists
func (h *GeneListHandler) ListGeneLists(c *gin.Context) {
	var req dto.PaginatedRequest
	c.ShouldBindQuery(&req)

	page := req.GetPage()
	pageSize := req.GetPageSize()
	category := c.Query("category")

	response, err := h.geneListService.ListGeneLists(c.Request.Context(), page, pageSize, category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("LIST_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse(*response))
}

// GetCategories handles GET /api/v1/gene-lists/categories
func (h *GeneListHandler) GetCategories(c *gin.Context) {
	categories := h.geneListService.GetCategories(c.Request.Context())
	c.JSON(http.StatusOK, dto.SuccessResponse(categories))
}

// SearchByGene handles GET /api/v1/gene-lists/search
func (h *GeneListHandler) SearchByGene(c *gin.Context) {
	gene := c.Query("gene")
	if gene == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("INVALID_REQUEST", "gene parameter is required", nil))
		return
	}

	var req dto.PaginatedRequest
	c.ShouldBindQuery(&req)

	page := req.GetPage()
	pageSize := req.GetPageSize()

	response, err := h.geneListService.SearchByGene(c.Request.Context(), gene, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("SEARCH_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse(*response))
}

// UpdateGeneList handles PUT /api/v1/gene-lists/:id
func (h *GeneListHandler) UpdateGeneList(c *gin.Context) {
	id := c.Param("id")

	var req dto.GeneListUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("INVALID_REQUEST", err.Error(), nil))
		return
	}

	response, err := h.geneListService.UpdateGeneList(c.Request.Context(), id, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("UPDATE_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse(*response))
}

// DeleteGeneList handles DELETE /api/v1/gene-lists/:id
func (h *GeneListHandler) DeleteGeneList(c *gin.Context) {
	id := c.Param("id")

	if err := h.geneListService.DeleteGeneList(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("DELETE_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse(map[string]string{"message": "Gene list deleted successfully"}))
}
