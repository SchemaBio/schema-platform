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
	// System Shared Repositories
	UserRepo           *repository.UserRepository
	TeamRepo           *repository.TeamRepository
	SequencerRepo      *repository.SequencerRepository
	SequencingRunRepo  *repository.SequencingRunRepository
	SampleSheetRepo    *repository.SampleSheetRepository
	SampleIndexRepo    *repository.SampleIndexRepository
	DataFileRepo       *repository.DataFileRepository
	BEDFileRepo        *repository.BEDFileRepository
	BaselineFileRepo   *repository.BaselineFileRepository

	// Somatic Business Repositories
	SampleRepo        *repository.SampleRepository
	AnalysisTaskRepo  *repository.AnalysisTaskRepository
	PipelineRepo      *repository.PipelineRepository
	ResultFileRepo    *repository.ResultFileRepository
	StorageSourceRepo *repository.StorageSourceRepository

	// Legacy Repositories (to be removed)
	PatientRepo *repository.PatientRepository
	BatchRepo   *repository.BatchRepository

	// JWT Manager
	JWTManager *jwt.Manager

	// System Shared Services
	AuthService       *service.AuthService
	UserService       *service.UserService
	TeamService       *service.TeamService
	SettingsService   *service.SettingsService
	SequencerService  *service.SequencerService
	SampleSheetService *service.SampleSheetService

	// Somatic Business Services
	SampleService       *service.SampleService
	AnalysisTaskService *service.AnalysisTaskService
	PipelineService     *service.PipelineService
	ResultFileService   *service.ResultFileService
	StorageSourceService *service.StorageSourceService

	// Legacy Services (to be removed)
	PatientService *service.PatientService
	BatchService   *service.BatchService

	// Handlers
	HealthHandler        *handler.HealthHandler
	AuthHandler          *handler.AuthHandler
	UserHandler          *handler.UserHandler
	TeamHandler          *handler.TeamHandler
	SettingsHandler      *handler.SettingsHandler
	SequencerHandler     *handler.SequencerHandler
	SampleSheetHandler   *handler.SampleSheetHandler
	SampleHandler        *handler.SampleHandler
	AnalysisTaskHandler  *handler.AnalysisTaskHandler
	PipelineHandler      *handler.PipelineHandler
	ResultFileHandler    *handler.ResultFileHandler
	StorageSourceHandler *handler.StorageSourceHandler

	// Legacy Handlers (to be removed)
	PatientHandler *handler.PatientHandler
	BatchHandler   *handler.BatchHandler
}

// NewDependencies initializes all dependencies
func NewDependencies(db *gorm.DB, jwtSecret string, jwtExpiryHours int) *Dependencies {
	// Initialize system shared repositories
	userRepo := repository.NewUserRepository(db)
	teamRepo := repository.NewTeamRepository(db)
	sequencerRepo := repository.NewSequencerRepository(db)
	sequencingRunRepo := repository.NewSequencingRunRepository(db)
	sampleSheetRepo := repository.NewSampleSheetRepository(db)
	sampleIndexRepo := repository.NewSampleIndexRepository(db)
	dataFileRepo := repository.NewDataFileRepository(db)
	bedFileRepo := repository.NewBEDFileRepository(db)
	baselineFileRepo := repository.NewBaselineFileRepository(db)

	// Initialize Somatic business repositories
	sampleRepo := repository.NewSampleRepository(db)
	analysisTaskRepo := repository.NewAnalysisTaskRepository(db)
	pipelineRepo := repository.NewPipelineRepository(db)
	resultFileRepo := repository.NewResultFileRepository(db)
	storageSourceRepo := repository.NewStorageSourceRepository(db)

	// Initialize legacy repositories (to be removed)
	patientRepo := repository.NewPatientRepository(db)
	batchRepo := repository.NewBatchRepository(db)

	// Initialize JWT Manager
	accessExpiry := time.Duration(jwtExpiryHours) * time.Hour
	if accessExpiry == 0 {
		accessExpiry = 24 * time.Hour // Default 24 hours
	}
	refreshExpiry := accessExpiry * 7 // Refresh token lasts 7 days longer

	jwtManager := jwt.NewManager(
		jwtSecret,
		accessExpiry,
		refreshExpiry,
		"schema-platform",
	)

	// Initialize system shared services
	authService := service.NewAuthService(userRepo, jwtManager)
	userService := service.NewUserService(userRepo)
	teamService := service.NewTeamService(teamRepo, userRepo)
	settingsService := service.NewSettingsService(db)
	sequencerService := service.NewSequencerService(sequencerRepo)
	sampleSheetService := service.NewSampleSheetService(sampleSheetRepo, sampleIndexRepo)

	// Initialize Somatic business services
	sampleService := service.NewSampleService(sampleRepo, dataFileRepo)
	analysisTaskService := service.NewAnalysisTaskService(analysisTaskRepo, sampleRepo, pipelineRepo)
	pipelineService := service.NewPipelineService(pipelineRepo)
	resultFileService := service.NewResultFileService(resultFileRepo)
	storageSourceService := service.NewStorageSourceService(storageSourceRepo)

	// Initialize legacy services (to be removed)
	patientService := service.NewPatientService(patientRepo, sampleRepo)
	batchService := service.NewBatchService(batchRepo, sampleRepo)

	// Initialize handlers
	healthHandler := handler.NewHealthHandler(db)
	authHandler := handler.NewAuthHandler(authService)
	userHandler := handler.NewUserHandler(userService)
	teamHandler := handler.NewTeamHandler(teamService)
	settingsHandler := handler.NewSettingsHandler(settingsService)
	sequencerHandler := handler.NewSequencerHandler(sequencerService)
	sampleSheetHandler := handler.NewSampleSheetHandler(sampleSheetService)
	sampleHandler := handler.NewSampleHandler(sampleService)
	analysisTaskHandler := handler.NewAnalysisTaskHandler(analysisTaskService)
	pipelineHandler := handler.NewPipelineHandler(pipelineService)
	resultFileHandler := handler.NewResultFileHandler(resultFileService)
	storageSourceHandler := handler.NewStorageSourceHandler(storageSourceService)

	// Initialize legacy handlers (to be removed)
	patientHandler := handler.NewPatientHandler(patientService)
	batchHandler := handler.NewBatchHandler(batchService)

	return &Dependencies{
		// System Shared Repositories
		UserRepo:          userRepo,
		TeamRepo:          teamRepo,
		SequencerRepo:     sequencerRepo,
		SequencingRunRepo: sequencingRunRepo,
		SampleSheetRepo:   sampleSheetRepo,
		SampleIndexRepo:   sampleIndexRepo,
		DataFileRepo:      dataFileRepo,
		BEDFileRepo:       bedFileRepo,
		BaselineFileRepo:  baselineFileRepo,

		// Somatic Business Repositories
		SampleRepo:        sampleRepo,
		AnalysisTaskRepo:  analysisTaskRepo,
		PipelineRepo:      pipelineRepo,
		ResultFileRepo:    resultFileRepo,
		StorageSourceRepo: storageSourceRepo,

		// Legacy Repositories
		PatientRepo: patientRepo,
		BatchRepo:   batchRepo,

		// JWT Manager
		JWTManager: jwtManager,

		// System Shared Services
		AuthService:       authService,
		UserService:       userService,
		TeamService:       teamService,
		SettingsService:   settingsService,
		SequencerService:  sequencerService,
		SampleSheetService: sampleSheetService,

		// Somatic Business Services
		SampleService:        sampleService,
		AnalysisTaskService:  analysisTaskService,
		PipelineService:      pipelineService,
		ResultFileService:    resultFileService,
		StorageSourceService: storageSourceService,

		// Legacy Services
		PatientService: patientService,
		BatchService:   batchService,

		// Handlers
		HealthHandler:        healthHandler,
		AuthHandler:          authHandler,
		UserHandler:          userHandler,
		TeamHandler:          teamHandler,
		SettingsHandler:      settingsHandler,
		SequencerHandler:     sequencerHandler,
		SampleSheetHandler:   sampleSheetHandler,
		SampleHandler:        sampleHandler,
		AnalysisTaskHandler:  analysisTaskHandler,
		PipelineHandler:      pipelineHandler,
		ResultFileHandler:    resultFileHandler,
		StorageSourceHandler: storageSourceHandler,

		// Legacy Handlers
		PatientHandler: patientHandler,
		BatchHandler:   batchHandler,
	}
}
