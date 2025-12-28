package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/middleware"
	"github.com/schema-platform/backend-api/internal/pkg/response"
	"github.com/schema-platform/backend-api/internal/service"
)

// TeamHandler handles team endpoints
type TeamHandler struct {
	teamService *service.TeamService
}

// NewTeamHandler creates a new team handler
func NewTeamHandler(teamService *service.TeamService) *TeamHandler {
	return &TeamHandler{teamService: teamService}
}

// GetTeams handles listing teams
func (h *TeamHandler) GetTeams(c *gin.Context) {
	var params dto.PaginatedRequest
	if err := c.ShouldBindQuery(&params); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.teamService.GetTeams(c.Request.Context(), &params)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// CreateTeam handles creating a team
func (h *TeamHandler) CreateTeam(c *gin.Context) {
	var req dto.TeamCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	userID := middleware.GetUserID(c)
	result, err := h.teamService.CreateTeam(c.Request.Context(), &req, userID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, result)
}

// GetTeam handles getting a team by ID
func (h *TeamHandler) GetTeam(c *gin.Context) {
	teamID := c.Param("id")

	result, err := h.teamService.GetTeam(c.Request.Context(), teamID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// UpdateTeam handles updating a team
func (h *TeamHandler) UpdateTeam(c *gin.Context) {
	teamID := c.Param("id")

	var req dto.TeamUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.teamService.UpdateTeam(c.Request.Context(), teamID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// DeleteTeam handles deleting a team
func (h *TeamHandler) DeleteTeam(c *gin.Context) {
	teamID := c.Param("id")

	if err := h.teamService.DeleteTeam(c.Request.Context(), teamID); err != nil {
		response.Error(c, err)
		return
	}

	response.NoContent(c)
}

// AddMember handles adding a member to a team
func (h *TeamHandler) AddMember(c *gin.Context) {
	teamID := c.Param("id")

	var req dto.TeamMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]interface{}{"error": err.Error()})
		return
	}

	result, err := h.teamService.AddMember(c.Request.Context(), teamID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, result)
}

// RemoveMember handles removing a member from a team
func (h *TeamHandler) RemoveMember(c *gin.Context) {
	teamID := c.Param("id")
	userID := c.Param("userId")

	if err := h.teamService.RemoveMember(c.Request.Context(), teamID, userID); err != nil {
		response.Error(c, err)
		return
	}

	response.NoContent(c)
}

// GetMembers handles getting team members
func (h *TeamHandler) GetMembers(c *gin.Context) {
	teamID := c.Param("id")

	result, err := h.teamService.GetMembers(c.Request.Context(), teamID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Success(c, result)
}

// RegisterRoutes registers team routes
func (h *TeamHandler) RegisterRoutes(r *gin.RouterGroup) {
	r.GET("", h.GetTeams)
	r.POST("", h.CreateTeam)
	r.GET("/:id", h.GetTeam)
	r.PUT("/:id", h.UpdateTeam)
	r.DELETE("/:id", h.DeleteTeam)
	r.GET("/:id/members", h.GetMembers)
	r.POST("/:id/members", h.AddMember)
	r.DELETE("/:id/members/:userId", h.RemoveMember)
}
