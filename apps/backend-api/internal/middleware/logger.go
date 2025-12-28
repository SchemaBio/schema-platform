package middleware

import (
	"log"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// LoggerConfig holds logger configuration
type LoggerConfig struct {
	SkipPaths    []string
	RedactFields []string
}

// DefaultLoggerConfig returns the default logger configuration
func DefaultLoggerConfig() LoggerConfig {
	return LoggerConfig{
		SkipPaths: []string{"/api/health", "/api/health/ready"},
		RedactFields: []string{
			"password",
			"token",
			"accessToken",
			"refreshToken",
			"authorization",
			"secret",
		},
	}
}

// Logger creates a logger middleware with default configuration
func Logger() gin.HandlerFunc {
	return LoggerWithConfig(DefaultLoggerConfig())
}

// LoggerWithConfig creates a logger middleware with custom configuration
func LoggerWithConfig(config LoggerConfig) gin.HandlerFunc {
	skipPaths := make(map[string]bool)
	for _, path := range config.SkipPaths {
		skipPaths[path] = true
	}

	return func(c *gin.Context) {
		// Skip logging for certain paths
		path := c.Request.URL.Path
		if skipPaths[path] {
			c.Next()
			return
		}

		// Start timer
		start := time.Now()

		// Process request
		c.Next()

		// Calculate latency
		latency := time.Since(start)

		// Get status code
		statusCode := c.Writer.Status()

		// Get client IP
		clientIP := c.ClientIP()

		// Get method
		method := c.Request.Method

		// Log request
		log.Printf("[%s] %s %s %d %v %s",
			method,
			path,
			clientIP,
			statusCode,
			latency,
			c.Errors.ByType(gin.ErrorTypePrivate).String(),
		)
	}
}

// RedactSensitiveData redacts sensitive data from a string
func RedactSensitiveData(data string, fields []string) string {
	result := data
	for _, field := range fields {
		// Redact JSON fields
		pattern := regexp.MustCompile(`"` + field + `"\s*:\s*"[^"]*"`)
		result = pattern.ReplaceAllString(result, `"`+field+`":"[REDACTED]"`)
		
		// Redact query parameters
		pattern = regexp.MustCompile(field + `=[^&\s]*`)
		result = pattern.ReplaceAllString(result, field+"=[REDACTED]")
	}
	return result
}

// RedactHeaders redacts sensitive headers
func RedactHeaders(headers map[string][]string) map[string][]string {
	sensitiveHeaders := []string{"authorization", "cookie", "set-cookie"}
	result := make(map[string][]string)
	
	for key, values := range headers {
		lowerKey := strings.ToLower(key)
		isSensitive := false
		for _, h := range sensitiveHeaders {
			if lowerKey == h {
				isSensitive = true
				break
			}
		}
		
		if isSensitive {
			result[key] = []string{"[REDACTED]"}
		} else {
			result[key] = values
		}
	}
	
	return result
}
