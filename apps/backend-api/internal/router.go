package internal

import (
	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/middleware"
	"github.com/schema-platform/backend-api/internal/pkg/jwt"
)

// SetupRouter configures all routes and middleware
func SetupRouter(deps *Dependencies, jwtManager *jwt.Manager) *gin.Engine {
	r := gin.New()

	// Global middleware
	r.Use(gin.Recovery())
	r.Use(middleware.Logger())
	r.Use(middleware.CORS())
	r.Use(middleware.ErrorHandler())

	// Health check routes (no auth required)
	r.GET("/api/health", deps.HealthHandler.Health)
	r.GET("/api/health/ready", deps.HealthHandler.Ready)

	// API v1 routes
	v1 := r.Group("/api/v1")

	// Auth routes (no auth required)
	auth := v1.Group("/auth")
	{
		auth.POST("/login", deps.AuthHandler.Login)
		auth.POST("/refresh", deps.AuthHandler.RefreshToken)
	}

	// Protected routes
	protected := v1.Group("")
	protected.Use(middleware.Auth(jwtManager))
	{
		// Auth logout
		protected.POST("/auth/logout", deps.AuthHandler.Logout)

		// User routes
		users := protected.Group("/users")
		deps.UserHandler.RegisterRoutes(users)

		// Team routes
		teams := protected.Group("/teams")
		deps.TeamHandler.RegisterRoutes(teams)

		// Patient routes
		patients := protected.Group("/patients")
		deps.PatientHandler.RegisterRoutes(patients)

		// Sample routes
		samples := protected.Group("/samples")
		deps.SampleHandler.RegisterRoutes(samples)

		// Batch routes
		batches := protected.Group("/batches")
		deps.BatchHandler.RegisterRoutes(batches)

		// Settings routes
		settings := protected.Group("/settings")
		deps.SettingsHandler.RegisterRoutes(settings)
	}

	return r
}
