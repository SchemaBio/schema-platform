package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/middleware"
	"github.com/schema-platform/backend-api/internal/pkg/response"
	"github.com/schema-platform/backend-api/internal/service"
)

// OrganizationHandler handles organization endpoints
type OrganizationHandler struct {
	orgService *service.OrganizationService
}

// NewOrganizationHandler creates a new organization handler
func NewOrganizationHandler(orgService *service.OrganizationService) *OrganizationHandler {
	return &OrganizationHandler{orgService: orgService}
}

// GetUserOrganizations handles listing user's organizations
// @Summary List user's organizations
// @Description Get all organizations the current user belongs to
// @Tags organizations
// @Produce json
// @Success 200 {object} dto.UserOrganizationsResponse
// @Failure 401 {object} response.ErrorResponse
// @Router /orgs [get]
func (h *OrganizationHandler) GetUserOrganizations(c *gin.Context) {
	userID := middleware.GetUserID(c)

	result, err := h.orgService.GetUserOrganizations(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// GetOrganization handles getting an organization by ID
// @Summary Get organization
// @Description Get organization details by ID
// @Tags organizations
// @Produce json
// @Param id path string true "Organization ID"
// @Success 200 {object} dto.OrganizationResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Router /orgs/{id} [get]
func (h *OrganizationHandler) GetOrganization(c *gin.Context) {
	orgID := c.Param("id")
	userID := middleware.GetUserID(c)

	result, err := h.orgService.GetOrganization(c.Request.Context(), orgID, userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// SwitchOrganization handles switching the user's current organization
// @Summary Switch organization
// @Description Switch the user's current working organization
// @Tags organizations
// @Accept json
// @Produce json
// @Param request body dto.SwitchOrganizationRequest true "Switch request"
// @Success 200 {object} dto.OrganizationResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Router /orgs/switch [post]
func (h *OrganizationHandler) SwitchOrganization(c *gin.Context) {
	var req dto.SwitchOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	userID := middleware.GetUserID(c)
	result, err := h.orgService.SwitchOrganization(c.Request.Context(), req.OrgID, userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// GetOrganizationMembers handles getting organization members
// @Summary Get organization members
// @Description Get all members of an organization
// @Tags organizations
// @Produce json
// @Param id path string true "Organization ID"
// @Success 200 {array} dto.OrgMemberResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Router /orgs/{id}/members [get]
func (h *OrganizationHandler) GetOrganizationMembers(c *gin.Context) {
	orgID := c.Param("id")

	result, err := h.orgService.GetOrganizationMembers(c.Request.Context(), orgID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// AddMember handles adding a member to an organization
// @Summary Add organization member
// @Description Add a new member to an organization
// @Tags organizations
// @Accept json
// @Produce json
// @Param id path string true "Organization ID"
// @Param request body dto.OrgMemberRequest true "Member request"
// @Success 201 {object} dto.OrgMemberResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Router /orgs/{id}/members [post]
func (h *OrganizationHandler) AddMember(c *gin.Context) {
	orgID := c.Param("id")

	var req dto.OrgMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	userID := middleware.GetUserID(c)
	result, err := h.orgService.AddMember(c.Request.Context(), orgID, &req, userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, result)
}

// RemoveMember handles removing a member from an organization
// @Summary Remove organization member
// @Description Remove a member from an organization
// @Tags organizations
// @Param id path string true "Organization ID"
// @Param userId path string true "User ID"
// @Success 204 "No Content"
// @Failure 401 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Router /orgs/{id}/members/{userId} [delete]
func (h *OrganizationHandler) RemoveMember(c *gin.Context) {
	orgID := c.Param("id")
	userID := c.Param("userId")

	if err := h.orgService.RemoveMember(c.Request.Context(), orgID, userID); err != nil {
		response.Error(c, err)
		return
	}

	response.NoContent(c)
}

// UpdateMemberRole handles updating a member's role
// @Summary Update member role
// @Description Update an organization member's role
// @Tags organizations
// @Accept json
// @Produce json
// @Param id path string true "Organization ID"
// @Param userId path string true "User ID"
// @Param request body dto.OrgMemberRoleUpdateRequest true "Role update request"
// @Success 200 {object} dto.OrgMemberResponse
// @Failure 400 {object} response.ErrorResponse
// @Failure 401 {object} response.ErrorResponse
// @Failure 403 {object} response.ErrorResponse
// @Failure 404 {object} response.ErrorResponse
// @Router /orgs/{id}/members/{userId}/role [put]
func (h *OrganizationHandler) UpdateMemberRole(c *gin.Context) {
	orgID := c.Param("id")
	userID := c.Param("userId")

	var req dto.OrgMemberRoleUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	if err := h.orgService.UpdateMemberRole(c.Request.Context(), orgID, userID, &req); err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, gin.H{"message": "Role updated successfully"})
}

// RegisterRoutes registers organization routes
func (h *OrganizationHandler) RegisterRoutes(r *gin.RouterGroup) {
	// User's organizations
	r.GET("", h.GetUserOrganizations)
	r.POST("/switch", h.SwitchOrganization)

	// Organization management (requires org membership)
	r.GET("/:id", h.GetOrganization)
	r.GET("/:id/members", h.GetOrganizationMembers)

	// Organization admin routes (requires OWNER/ADMIN role)
	r.POST("/:id/members", h.AddMember)
	r.DELETE("/:id/members/:userId", h.RemoveMember)
	r.PUT("/:id/members/:userId/role", h.UpdateMemberRole)
}