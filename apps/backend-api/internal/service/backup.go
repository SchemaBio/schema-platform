package service

import (
	"bytes"
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/config"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/pkg/errors"
)

// BackupService handles database backup operations
type BackupService struct {
	cfg *config.Config
}

// NewBackupService creates a new backup service
func NewBackupService(cfg *config.Config) *BackupService {
	return &BackupService{cfg: cfg}
}

// Backup creates a database backup
func (s *BackupService) Backup(ctx context.Context, req *dto.BackupRequest) (*dto.BackupResponse, error) {
	// Generate backup ID and filename
	backupID := uuid.New().String()
	timestamp := time.Now().Format("20060102_150405")
	dbName := s.cfg.Database.DBName

	// Determine output path
	outputDir := req.OutputPath
	if outputDir == "" {
		outputDir = "./backups"
	}

	// Ensure output directory exists
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return nil, errors.WrapInternalError("Failed to create backup directory", err)
	}

	// Build filename
	ext := "sql"
	if req.Compress {
		ext = "sql.gz"
	}
	filename := fmt.Sprintf("%s_%s.%s", dbName, timestamp, ext)
	backupPath := filepath.Join(outputDir, filename)

	// Build pg_dump command
	var cmd *exec.Cmd
	if req.Compress {
		cmd = exec.CommandContext(ctx, "pg_dump",
			"-h", s.cfg.Database.Host,
			"-p", fmt.Sprintf("%d", s.cfg.Database.Port),
			"-U", s.cfg.Database.User,
			"-d", dbName,
			"--no-password",
			"-Fp", // Plain SQL format
		)
	} else {
		cmd = exec.CommandContext(ctx, "pg_dump",
			"-h", s.cfg.Database.Host,
			"-p", fmt.Sprintf("%d", s.cfg.Database.Port),
			"-U", s.cfg.Database.User,
			"-d", dbName,
			"--no-password",
			"-Fp",
		)
	}

	// Set PGPASSWORD environment variable
	env := os.Environ()
	env = append(env, fmt.Sprintf("PGPASSWORD=%s", s.cfg.Database.Password))
	cmd.Env = env

	// Create output file
	var output io.Writer
	if req.Compress {
		file, err := os.Create(backupPath)
		if err != nil {
			return nil, errors.WrapInternalError("Failed to create backup file", err)
		}
		defer file.Close()

		gzipWriter := gzip.NewWriter(file)
		defer gzipWriter.Close()

		cmd.Stdout = gzipWriter
		cmd.Stderr = bytes.NewBuffer(nil)
	} else {
		file, err := os.Create(backupPath)
		if err != nil {
			return nil, errors.WrapInternalError("Failed to create backup file", err)
		}
		defer file.Close()

		cmd.Stdout = file
		cmd.Stderr = bytes.NewBuffer(nil)
	}

	// Execute backup
	if err := cmd.Run(); err != nil {
		// Clean up failed backup
		os.Remove(backupPath)
		return nil, errors.WrapInternalError("Failed to execute pg_dump", err)
	}

	// Get file info
	fileInfo, err := os.Stat(backupPath)
	if err != nil {
		return nil, errors.WrapInternalError("Failed to get backup file info", err)
	}

	return &dto.BackupResponse{
		BackupID:     backupID,
		FilePath:     backupPath,
		FileSize:     fileInfo.Size(),
		DatabaseName: dbName,
		CreatedAt:    time.Now().Format(time.RFC3339),
	}, nil
}

// Restore restores a database from a backup file
func (s *BackupService) Restore(ctx context.Context, req *dto.RestoreRequest) (*dto.RestoreResponse, error) {
	// Validate backup file exists
	if _, err := os.Stat(req.BackupFilePath); os.IsNotExist(err) {
		return nil, errors.NewValidationError("Backup file not found")
	}

	restoreID := uuid.New().String()

	// Check if it's a gzip file
	isGzip := strings.HasSuffix(req.BackupFilePath, ".gz")

	// Build psql command
	var cmd *exec.Cmd
	if isGzip {
		cmd = exec.CommandContext(ctx, "bash", "-c",
			fmt.Sprintf("gunzip -c %s | psql -h %s -p %d -U %s -d %s --no-password",
				req.BackupFilePath,
				s.cfg.Database.Host,
				s.cfg.Database.Port,
				s.cfg.Database.User,
				s.cfg.Database.DBName,
			))
	} else {
		cmd = exec.CommandContext(ctx, "psql",
			"-h", s.cfg.Database.Host,
			"-p", fmt.Sprintf("%d", s.cfg.Database.Port),
			"-U", s.cfg.Database.User,
			"-d", s.cfg.Database.DBName,
			"-f", req.BackupFilePath,
			"--no-password",
		)
	}

	// Set PGPASSWORD environment variable
	env := os.Environ()
	env = append(env, fmt.Sprintf("PGPASSWORD=%s", s.cfg.Database.Password))
	cmd.Env = env

	// Execute restore
	if err := cmd.Run(); err != nil {
		return nil, errors.WrapInternalError("Failed to restore database", err)
	}

	return &dto.RestoreResponse{
		RestoreID:   restoreID,
		Status:      "completed",
		Message:     "Database restored successfully",
		CompletedAt: time.Now().Format(time.RFC3339),
	}, nil
}

// ListBackups lists all available backup files
func (s *BackupService) ListBackups(ctx context.Context, backupDir string) (*dto.BackupListResponse, error) {
	if backupDir == "" {
		backupDir = "./backups"
	}

	// Check if directory exists
	if _, err := os.Stat(backupDir); os.IsNotExist(err) {
		return &dto.BackupListResponse{
			Backups:     []dto.BackupInfo{},
			TotalCount:  0,
			StorageUsed: 0,
		}, nil
	}

	// Read directory entries
	entries, err := os.ReadDir(backupDir)
	if err != nil {
		return nil, errors.WrapInternalError("Failed to read backup directory", err)
	}

	var backups []dto.BackupInfo
	var totalSize int64

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		// Skip non-backup files
		name := entry.Name()
		if !strings.HasSuffix(name, ".sql") && !strings.HasSuffix(name, ".sql.gz") {
			continue
		}

		info, err := entry.Info()
		if err != nil {
			continue
		}

		backupID := uuid.NewSHA1(uuid.NameSpaceURL, []byte(name)).String()

		backups = append(backups, dto.BackupInfo{
			ID:        backupID,
			FileName:  name,
			FilePath:  filepath.Join(backupDir, name),
			FileSize:  info.Size(),
			CreatedAt: info.ModTime().Format(time.RFC3339),
		})

		totalSize += info.Size()
	}

	return &dto.BackupListResponse{
		Backups:     backups,
		TotalCount:  len(backups),
		StorageUsed: totalSize,
	}, nil
}

// DeleteBackup deletes a backup file
func (s *BackupService) DeleteBackup(ctx context.Context, filePath string) error {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return errors.NewValidationError("Backup file not found")
	}

	if err := os.Remove(filePath); err != nil {
		return errors.WrapInternalError("Failed to delete backup file", err)
	}

	return nil
}

// GetBackupFile returns a reader for downloading a backup file
func (s *BackupService) GetBackupFile(ctx context.Context, filePath string) (io.Reader, error) {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil, errors.NewValidationError("Backup file not found")
	}

	file, err := os.Open(filePath)
	if err != nil {
		return nil, errors.WrapInternalError("Failed to open backup file", err)
	}

	return file, nil
}
