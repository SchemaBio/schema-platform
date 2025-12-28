package dto

import "time"

// TeamCreateRequest represents the request to create a team
type TeamCreateRequest struct {
	Name        string `json:"name" binding:"required,min=2,max=100"`
	Description string `json:"description" binding:"omitempty,max=500"`
}

// TeamUpdateRequest represents the request to update a team
type TeamUpdateRequest struct {
	Name        *string `json:"name" binding:"omitempty,min=2,max=100"`
	Description *string `json:"description" binding:"omitempty,max=500"`
}

// TeamResponse represents the team response
type TeamResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	OwnerID     string    `json:"ownerId"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// TeamMemberRequest represents the request to add a member to a team
type TeamMemberRequest struct {
	UserID string `json:"userId" binding:"required,uuid"`
	Role   string `json:"role" binding:"required,oneof=ADMIN DOCTOR ANALYST VIEWER"`
}

// TeamMemberResponse represents a team member response
type TeamMemberResponse struct {
	UserID   string    `json:"userId"`
	TeamID   string    `json:"teamId"`
	Role     string    `json:"role"`
	JoinedAt time.Time `json:"joinedAt"`
	User     *UserResponse `json:"user,omitempty"`
}

// TeamListResponse represents a list of teams with pagination
type TeamListResponse struct {
	Items      []TeamResponse `json:"items"`
	Total      int64          `json:"total"`
	Page       int            `json:"page"`
	PageSize   int            `json:"pageSize"`
	TotalPages int            `json:"totalPages"`
}


// TeamWithMembersResponse represents a team with its members
type TeamWithMembersResponse struct {
	TeamResponse
	Members []TeamMemberResponse `json:"members"`
}
