package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/pkg/errors"
)

// Success sends a successful JSON response
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}

// Created sends a 201 Created response
func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    data,
	})
}

// NoContent sends a 204 No Content response
func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

// Error sends an error response
func Error(c *gin.Context, err error) {
	appErr, ok := errors.AsAppError(err)
	if !ok {
		// Wrap unknown errors as internal errors
		appErr = errors.NewInternalError("An unexpected error occurred")
	}

	c.JSON(appErr.HTTPStatus, gin.H{
		"success": false,
		"error": gin.H{
			"code":    appErr.Code,
			"message": appErr.Message,
			"details": appErr.Details,
		},
	})
}

// ErrorWithStatus sends an error response with a specific status code
func ErrorWithStatus(c *gin.Context, status int, code, message string) {
	c.JSON(status, gin.H{
		"success": false,
		"error": gin.H{
			"code":    code,
			"message": message,
		},
	})
}

// ValidationError sends a validation error response
func ValidationError(c *gin.Context, details map[string]interface{}) {
	c.JSON(http.StatusBadRequest, gin.H{
		"success": false,
		"error": gin.H{
			"code":    errors.ErrCodeValidation,
			"message": "Validation failed",
			"details": details,
		},
	})
}

// Paginated sends a paginated response
func Paginated(c *gin.Context, items interface{}, total int64, page, pageSize int) {
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"items":      items,
			"total":      total,
			"page":       page,
			"pageSize":   pageSize,
			"totalPages": totalPages,
		},
	})
}

// Unauthorized sends a 401 Unauthorized response
func Unauthorized(c *gin.Context, message string) {
	if message == "" {
		message = "Unauthorized"
	}
	c.JSON(http.StatusUnauthorized, gin.H{
		"success": false,
		"error": gin.H{
			"code":    errors.ErrCodeUnauthorized,
			"message": message,
		},
	})
}

// Forbidden sends a 403 Forbidden response
func Forbidden(c *gin.Context, message string) {
	if message == "" {
		message = "Forbidden"
	}
	c.JSON(http.StatusForbidden, gin.H{
		"success": false,
		"error": gin.H{
			"code":    errors.ErrCodeForbidden,
			"message": message,
		},
	})
}

// NotFound sends a 404 Not Found response
func NotFound(c *gin.Context, resource string) {
	c.JSON(http.StatusNotFound, gin.H{
		"success": false,
		"error": gin.H{
			"code":    errors.ErrCodeNotFound,
			"message": resource + " not found",
		},
	})
}

// Conflict sends a 409 Conflict response
func Conflict(c *gin.Context, message string) {
	c.JSON(http.StatusConflict, gin.H{
		"success": false,
		"error": gin.H{
			"code":    errors.ErrCodeConflict,
			"message": message,
		},
	})
}

// TooManyRequests sends a 429 Too Many Requests response
func TooManyRequests(c *gin.Context) {
	c.JSON(http.StatusTooManyRequests, gin.H{
		"success": false,
		"error": gin.H{
			"code":    errors.ErrCodeRateLimit,
			"message": "Rate limit exceeded. Please try again later.",
		},
	})
}
