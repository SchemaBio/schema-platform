package dto

// PaginatedRequest represents common pagination parameters
type PaginatedRequest struct {
	Page      int    `form:"page" binding:"omitempty,min=1"`
	PageSize  int    `form:"pageSize" binding:"omitempty,min=1,max=100"`
	SortBy    string `form:"sortBy" binding:"omitempty"`
	SortOrder string `form:"sortOrder" binding:"omitempty,oneof=asc desc"`
}

// GetPage returns the page number with default value
func (p *PaginatedRequest) GetPage() int {
	if p.Page <= 0 {
		return 1
	}
	return p.Page
}

// GetPageSize returns the page size with default value
func (p *PaginatedRequest) GetPageSize() int {
	if p.PageSize <= 0 {
		return 20
	}
	if p.PageSize > 100 {
		return 100
	}
	return p.PageSize
}

// GetOffset returns the offset for database queries
func (p *PaginatedRequest) GetOffset() int {
	return (p.GetPage() - 1) * p.GetPageSize()
}

// GetSortOrder returns the sort order with default value
func (p *PaginatedRequest) GetSortOrder() string {
	if p.SortOrder == "" {
		return "desc"
	}
	return p.SortOrder
}

// PaginatedResponse represents a generic paginated response
type PaginatedResponse[T any] struct {
	Items      []T   `json:"items"`
	Total      int64 `json:"total"`
	Page       int   `json:"page"`
	PageSize   int   `json:"pageSize"`
	TotalPages int   `json:"totalPages"`
}

// NewPaginatedResponse creates a new paginated response
func NewPaginatedResponse[T any](items []T, total int64, page, pageSize int) *PaginatedResponse[T] {
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}
	return &PaginatedResponse[T]{
		Items:      items,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}

// ApiError represents a structured API error response
type ApiError struct {
	Code    string                 `json:"code"`
	Message string                 `json:"message"`
	Details map[string]interface{} `json:"details,omitempty"`
}

// ApiResponse represents a generic API response
type ApiResponse[T any] struct {
	Success bool      `json:"success"`
	Data    *T        `json:"data,omitempty"`
	Error   *ApiError `json:"error,omitempty"`
}

// SuccessResponse creates a success response
func SuccessResponse[T any](data T) *ApiResponse[T] {
	return &ApiResponse[T]{
		Success: true,
		Data:    &data,
	}
}

// ErrorResponse creates an error response
func ErrorResponse(code, message string, details map[string]interface{}) *ApiResponse[any] {
	return &ApiResponse[any]{
		Success: false,
		Error: &ApiError{
			Code:    code,
			Message: message,
			Details: details,
		},
	}
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string `json:"status"`
	Database  string `json:"database,omitempty"`
	Timestamp string `json:"timestamp"`
}
