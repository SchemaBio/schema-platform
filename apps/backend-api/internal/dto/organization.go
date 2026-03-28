package dto

import "time"

// OrganizationResponse represents an organization response
type OrganizationResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	Plan        string    `json:"plan"`
	MaxUsers    int       `json:"maxUsers"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// UserOrganizationInfo represents an organization with user's role
type UserOrganizationInfo struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	OrgRole     string    `json:"orgRole"`
	JoinedAt    time.Time `json:"joinedAt"`
}

// UserOrganizationsResponse represents the response for user's organizations
type UserOrganizationsResponse struct {
	Organizations []UserOrganizationInfo `json:"organizations"`
}

// SwitchOrganizationRequest represents a switch organization request
type SwitchOrganizationRequest struct {
	OrgID string `json:"orgId" binding:"required"`
}

// OrgMemberRequest represents a request to add a member to an organization
type OrgMemberRequest struct {
	UserID  string `json:"userId" binding:"required"`
	OrgRole string `json:"orgRole" binding:"required"`
}

// OrgMemberResponse represents an organization member response
type OrgMemberResponse struct {
	UserID    string    `json:"userId"`
	OrgID     string    `json:"orgId"`
	OrgRole   string    `json:"orgRole"`
	JoinedAt  time.Time `json:"joinedAt"`
	UserName  string    `json:"userName,omitempty"`
	UserEmail string    `json:"userEmail,omitempty"`
}

// OrgMemberRoleUpdateRequest represents a request to update a member's role
type OrgMemberRoleUpdateRequest struct {
	OrgRole string `json:"orgRole" binding:"required"`
}

// OrganizationCreateRequest represents a request to create an organization
type OrganizationCreateRequest struct {
	Name        string `json:"name" binding:"required"`
	Slug        string `json:"slug" binding:"required"`
	Description string `json:"description"`
	Plan        string `json:"plan"`
	MaxUsers    int    `json:"maxUsers"`
}

// OrganizationUpdateRequest represents a request to update an organization
type OrganizationUpdateRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	Status      *string `json:"status"`
	MaxUsers    *int    `json:"maxUsers"`
}