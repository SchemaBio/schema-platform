package database

import (
	"context"
	"fmt"
	"time"

	"github.com/schema-platform/backend-api/internal/config"
	"github.com/schema-platform/backend-api/internal/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB holds the database connection
var DB *gorm.DB

// Connect establishes a connection to the PostgreSQL database
func Connect(cfg *config.DatabaseConfig) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode,
	)

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	db, err := gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Get underlying sql.DB to configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	// Configure connection pool
	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(cfg.MaxLifetime)

	DB = db
	return db, nil
}

// AutoMigrate runs database migrations for all models
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		// System shared tables
		&model.User{},
		&model.Team{},
		&model.TeamMember{},
		&model.Permission{},
		&model.RolePermission{},
		&model.SystemConfig{},
		&model.UserSettings{},
		&model.Sequencer{},
		&model.SequencingRun{},
		&model.SampleSheet{},
		&model.SampleIndex{},
		&model.DataFile{},
		&model.BEDFile{},
		&model.BaselineFile{},

		// Somatic business tables
		&model.Sample{},
		&model.AnalysisTask{},
		&model.Pipeline{},
		&model.ResultFile{},
		&model.StorageSource{},

		// Legacy tables (to be removed)
		&model.Patient{},
		&model.Batch{},
	)
}

// Close closes the database connection
func Close() error {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}
	return nil
}

// HealthCheck verifies the database connection is alive
func HealthCheck() error {
	if DB == nil {
		return fmt.Errorf("database not initialized")
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := sqlDB.PingContext(ctx); err != nil {
		return fmt.Errorf("database ping failed: %w", err)
	}

	return nil
}
