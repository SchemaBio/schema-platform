package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// HealthHandler handles health check endpoints
type HealthHandler struct {
	db *gorm.DB
}

// NewHealthHandler creates a new health handler
func NewHealthHandler(db *gorm.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

// Health handles the basic health check endpoint
// @Summary Basic health check
// @Description Returns the health status of the API
// @Tags health
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/health [get]
func (h *HealthHandler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"status":    "healthy",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		},
	})
}

// Ready handles the readiness check endpoint
// @Summary Readiness check
// @Description Returns the readiness status including database connectivity
// @Tags health
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 503 {object} map[string]interface{}
// @Router /api/health/ready [get]
func (h *HealthHandler) Ready(c *gin.Context) {
	// Check database connectivity
	dbStatus := "healthy"
	sqlDB, err := h.db.DB()
	if err != nil || sqlDB.Ping() != nil {
		dbStatus = "unhealthy"
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"success": false,
			"data": gin.H{
				"status":    "unhealthy",
				"database":  dbStatus,
				"timestamp": time.Now().UTC().Format(time.RFC3339),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"status":    "healthy",
			"database":  dbStatus,
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		},
	})
}

// RegisterRoutes registers health check routes
func (h *HealthHandler) RegisterRoutes(r *gin.RouterGroup) {
	r.GET("", h.Health)
	r.GET("/ready", h.Ready)
}
