package dto

import "time"

// UserCreateRequest represents the request to create a user
type UserCreateRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Name     string `json:"name" binding:"required,min=2,max=100"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role" binding:"omitempty,oneof=ADMIN DOCTOR ANALYST VIEWER"`
}

// UserUpdateRequest represents the request to update a user
type UserUpdateRequest struct {
	Name *string `json:"name" binding:"omitempty,min=2,max=100"`
	Role *string `json:"role" binding:"omitempty,oneof=ADMIN DOCTOR ANALYST VIEWER"`
}

// UserResponse represents the user response
type UserResponse struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Role      string    `json:"role"`
	TeamID    *string   `json:"teamId"`
	IsActive  bool      `json:"isActive"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// UserListResponse represents a list of users with pagination
type UserListResponse struct {
	Items      []UserResponse `json:"items"`
	Total      int64          `json:"total"`
	Page       int            `json:"page"`
	PageSize   int            `json:"pageSize"`
	TotalPages int            `json:"totalPages"`
}
