package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/repository"
	"github.com/schema-platform/backend-api/internal/service"
)

// PedigreeHandler handles pedigree operations
type PedigreeHandler struct {
	pedigreeService *service.PedigreeService
}

// NewPedigreeHandler creates a new pedigree handler
func NewPedigreeHandler(pedigreeRepo *repository.PedigreeRepository, memberRepo *repository.PedigreeMemberRepository, sampleRepo *repository.SampleRepository) *PedigreeHandler {
	return &PedigreeHandler{
		pedigreeService: service.NewPedigreeService(pedigreeRepo, memberRepo, sampleRepo),
	}
}

// RegisterRoutes registers pedigree routes
func (h *PedigreeHandler) RegisterRoutes(r *gin.RouterGroup) {
	pedigrees := r.Group("/pedigrees")
	{
		pedigrees.POST("", h.CreatePedigree)
		pedigrees.GET("", h.ListPedigrees)
		pedigrees.GET("/:id", h.GetPedigree)
		pedigrees.PUT("/:id", h.UpdatePedigree)
		pedigrees.DELETE("/:id", h.DeletePedigree)

		// Member routes
		pedigrees.POST("/:id/members", h.AddMember)
		pedigrees.GET("/:id/members", h.GetMembers)
		pedigrees.PUT("/members/:memberId", h.UpdateMember)
		pedigrees.DELETE("/members/:memberId", h.DeleteMember)
	}
}

// CreatePedigree handles POST /api/v1/pedigrees
func (h *PedigreeHandler) CreatePedigree(c *gin.Context) {
	var req dto.PedigreeCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("INVALID_REQUEST", err.Error(), nil))
		return
	}

	response, err := h.pedigreeService.CreatePedigree(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("CREATE_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusCreated, dto.SuccessResponse(*response))
}

// GetPedigree handles GET /api/v1/pedigrees/:id
func (h *PedigreeHandler) GetPedigree(c *gin.Context) {
	id := c.Param("id")

	response, err := h.pedigreeService.GetPedigree(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse("NOT_FOUND", err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse(*response))
}

// ListPedigrees handles GET /api/v1/pedigrees
func (h *PedigreeHandler) ListPedigrees(c *gin.Context) {
	var req dto.PaginatedRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("INVALID_REQUEST", err.Error(), nil))
		return
	}

	page := req.GetPage()
	pageSize := req.GetPageSize()

	response, err := h.pedigreeService.ListPedigrees(c.Request.Context(), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("LIST_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse(*response))
}

// UpdatePedigree handles PUT /api/v1/pedigrees/:id
func (h *PedigreeHandler) UpdatePedigree(c *gin.Context) {
	id := c.Param("id")

	var req dto.PedigreeUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("INVALID_REQUEST", err.Error(), nil))
		return
	}

	response, err := h.pedigreeService.UpdatePedigree(c.Request.Context(), id, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("UPDATE_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse(*response))
}

// DeletePedigree handles DELETE /api/v1/pedigrees/:id
func (h *PedigreeHandler) DeletePedigree(c *gin.Context) {
	id := c.Param("id")

	if err := h.pedigreeService.DeletePedigree(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("DELETE_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse(map[string]string{"message": "Pedigree deleted successfully"}))
}

// AddMember handles POST /api/v1/pedigrees/:id/members
func (h *PedigreeHandler) AddMember(c *gin.Context) {
	pedigreeID := c.Param("id")

	var req dto.PedigreeMemberCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("INVALID_REQUEST", err.Error(), nil))
		return
	}

	response, err := h.pedigreeService.AddMember(c.Request.Context(), pedigreeID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("ADD_MEMBER_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusCreated, dto.SuccessResponse(*response))
}

// GetMembers handles GET /api/v1/pedigrees/:id/members
func (h *PedigreeHandler) GetMembers(c *gin.Context) {
	pedigreeID := c.Param("id")

	response, err := h.pedigreeService.GetMembers(c.Request.Context(), pedigreeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("GET_MEMBERS_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse(response))
}

// UpdateMember handles PUT /api/v1/pedigrees/members/:memberId
func (h *PedigreeHandler) UpdateMember(c *gin.Context) {
	memberID := c.Param("memberId")

	var req dto.PedigreeMemberUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse("INVALID_REQUEST", err.Error(), nil))
		return
	}

	response, err := h.pedigreeService.UpdateMember(c.Request.Context(), memberID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("UPDATE_MEMBER_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse(*response))
}

// DeleteMember handles DELETE /api/v1/pedigrees/members/:memberId
func (h *PedigreeHandler) DeleteMember(c *gin.Context) {
	memberID := c.Param("memberId")

	if err := h.pedigreeService.DeleteMember(c.Request.Context(), memberID); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse("DELETE_MEMBER_FAILED", err.Error(), nil))
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse(map[string]string{"message": "Member deleted successfully"}))
}
