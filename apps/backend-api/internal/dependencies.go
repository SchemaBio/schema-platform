package internal

import (
	"time"

	"github.com/schema-platform/backend-api/internal/handler"
	"github.com/schema-platform/backend-api/internal/pkg/jwt"
	"github.com/schema-platform/backend-api/internal/repository"
	"github.com/schema-platform/backend-api/internal/service"
	"gorm.io/gorm"
)

// Dependencies holds all application dependencies
type Dependencies struct {
	// Repositories
	UserRepo    *repository.UserRepository
	TeamRepo    *repository.TeamRepository
	PatientRepo *repository.PatientRepository
	SampleRepo  *repository.SampleRepository
	BatchRepo   *repository.BatchRepository

	// JWT Manager
	JWTManager *jwt.Manager

	// Services
	AuthService     *service.AuthService
	UserService     *service.UserService
	TeamService     *service.TeamService
	PatientService  *service.PatientService
	SampleService   *service.SampleService
	BatchService    *service.BatchService
	SettingsService *service.SettingsService

	// Handlers
	HealthHandler   *handler.HealthHandler
	AuthHandler     *handler.AuthHandler
	UserHandler     *handler.UserHandler
	TeamHandler     *handler.TeamHandler
	PatientHandler  *handler.PatientHandler
	SampleHandler   *handler.SampleHandler
	BatchHandler    *handler.BatchHandler
	SettingsHandler *handler.SettingsHandler
}

// NewDependencies initializes all dependencies
func NewDependencies(db *gorm.DB, jwtSecret string, jwtExpiryHours int) *Dependencies {
	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	teamRepo := repository.NewTeamRepository(db)
	patientRepo := repository.NewPatientRepository(db)
	sampleRepo := repository.NewSampleRepository(db)
	batchRepo := repository.NewBatchRepository(db)

	// Initialize JWT Manager
	accessExpiry := time.Duration(jwtExpiryHours) * time.Hour
	if accessExpiry == 0 {
		accessExpiry = 15 * time.Minute // Default
	}
	refreshExpiry := accessExpiry * 7 * 24 // Refresh token lasts 7 days longer
	
	jwtManager := jwt.NewManager(
		jwtSecret,
		accessExpiry,
		refreshExpiry,
		"schema-platform",
	)

	// Initialize services
	authService := service.NewAuthService(userRepo, jwtManager)
	userService := service.NewUserService(userRepo)
	teamService := service.NewTeamService(teamRepo, userRepo)
	patientService := service.NewPatientService(patientRepo, sampleRepo)
	sampleService := service.NewSampleService(sampleRepo, patientRepo, batchRepo)
	batchService := service.NewBatchService(batchRepo, sampleRepo)
	settingsService := service.NewSettingsService(db)

	// Initialize handlers
	healthHandler := handler.NewHealthHandler(db)
	authHandler := handler.NewAuthHandler(authService)
	userHandler := handler.NewUserHandler(userService)
	teamHandler := handler.NewTeamHandler(teamService)
	patientHandler := handler.NewPatientHandler(patientService)
	sampleHandler := handler.NewSampleHandler(sampleService)
	batchHandler := handler.NewBatchHandler(batchService)
	settingsHandler := handler.NewSettingsHandler(settingsService)

	return &Dependencies{
		// Repositories
		UserRepo:    userRepo,
		TeamRepo:    teamRepo,
		PatientRepo: patientRepo,
		SampleRepo:  sampleRepo,
		BatchRepo:   batchRepo,

		// JWT Manager
		JWTManager: jwtManager,

		// Services
		AuthService:     authService,
		UserService:     userService,
		TeamService:     teamService,
		PatientService:  patientService,
		SampleService:   sampleService,
		BatchService:    batchService,
		SettingsService: settingsService,

		// Handlers
		HealthHandler:   healthHandler,
		AuthHandler:     authHandler,
		UserHandler:     userHandler,
		TeamHandler:     teamHandler,
		PatientHandler:  patientHandler,
		SampleHandler:   sampleHandler,
		BatchHandler:    batchHandler,
		SettingsHandler: settingsHandler,
	}
}
