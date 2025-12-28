package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/pkg/errors"
)

// ErrorHandler creates an error handling middleware
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Check if there are any errors
		if len(c.Errors) > 0 {
			err := c.Errors.Last().Err

			// Try to convert to AppError
			appErr, ok := errors.AsAppError(err)
			if ok {
				c.JSON(appErr.HTTPStatus, gin.H{
					"success": false,
					"error": gin.H{
						"code":    appErr.Code,
						"message": appErr.Message,
						"details": appErr.Details,
					},
				})
				return
			}

			// Log the error for debugging
			log.Printf("Unhandled error: %v", err)

			// Return generic internal error (hide details)
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error": gin.H{
					"code":    errors.ErrCodeInternal,
					"message": "An internal error occurred",
				},
			})
		}
	}
}

// Recovery creates a recovery middleware that catches panics
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log the panic
				log.Printf("Panic recovered: %v", err)

				// Return internal error
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"error": gin.H{
						"code":    errors.ErrCodeInternal,
						"message": "An internal error occurred",
					},
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}
