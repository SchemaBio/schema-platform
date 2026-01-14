package internal

import (
	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/config"
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

		// Settings routes
		settings := protected.Group("/settings")
		deps.SettingsHandler.RegisterRoutes(settings)

		// === Analysis-specific Routes ===
		if deps.Config.Analysis.Type == config.AnalysisTypeGermline {
			// Germline-specific routes
			germline := protected.Group("/germline")
			{
				// Pedigree routes
				pedigrees := germline.Group("/pedigrees")
				deps.PedigreeHandler.RegisterRoutes(pedigrees)

				// Gene list routes
				geneLists := germline.Group("/gene-lists")
				deps.GeneListHandler.RegisterRoutes(geneLists)
			}
		} else {
			// Somatic-specific routes
			somatic := protected.Group("/somatic")
			{
				// Sample routes
				samples := somatic.Group("/samples")
				deps.SampleHandler.RegisterRoutes(samples)

				// Analysis task routes
				analysisTasks := somatic.Group("/analysis-tasks")
				deps.AnalysisTaskHandler.RegisterRoutes(analysisTasks)
			}
		}

		// === Shared Analysis Routes ===

		// Pipeline routes
		pipelines := protected.Group("/pipelines")
		deps.PipelineHandler.RegisterRoutes(pipelines)

		// Result file routes
		resultFiles := protected.Group("/results")
		deps.ResultFileHandler.RegisterRoutes(resultFiles)

		// Storage source routes
		storageSources := protected.Group("/storage-sources")
		deps.StorageSourceHandler.RegisterRoutes(storageSources)

		// === Sequencing Platform Routes ===

		// Sequencer routes
		sequencers := protected.Group("/sequencers")
		deps.SequencerHandler.RegisterRoutes(sequencers)

		// Sample sheet routes
		sampleSheets := protected.Group("/sample-sheets")
		deps.SampleSheetHandler.RegisterRoutes(sampleSheets)

		// === Backup Routes ===

		backups := protected.Group("/backups")
		{
			backups.GET("", deps.BackupHandler.ListBackups)
			backups.POST("", deps.BackupHandler.CreateBackup)
			backups.GET("/:filename", deps.BackupHandler.DownloadBackup)
			backups.DELETE("/:filename", deps.BackupHandler.DeleteBackup)
			backups.POST("/restore", deps.BackupHandler.RestoreDatabase)
		}

		// === Legacy Routes (to be removed) ===

		// Patient routes
		patients := protected.Group("/patients")
		deps.PatientHandler.RegisterRoutes(patients)

		// Batch routes
		batches := protected.Group("/batches")
		deps.BatchHandler.RegisterRoutes(batches)
	}

	return r
}
