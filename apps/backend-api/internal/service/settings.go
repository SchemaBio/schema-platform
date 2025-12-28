package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"github.com/schema-platform/backend-api/pkg/errors"
	"gorm.io/gorm"
)

// SettingsRepository interface for settings data access
type SettingsRepository interface {
	GetUserSettings(ctx context.Context, userID uuid.UUID) (*model.UserSettings, error)
	CreateUserSettings(ctx context.Context, settings *model.UserSettings) error
	UpdateUserSettings(ctx context.Context, settings *model.UserSettings) error
	GetSystemConfig(ctx context.Context, key string) (*model.SystemConfig, error)
	CreateSystemConfig(ctx context.Context, config *model.SystemConfig) error
	UpdateSystemConfig(ctx context.Context, config *model.SystemConfig) error
	GetAllSystemConfigs(ctx context.Context) ([]model.SystemConfig, error)
}

// SettingsService handles settings operations
type SettingsService struct {
	db *gorm.DB
}

// NewSettingsService creates a new settings service
func NewSettingsService(db *gorm.DB) *SettingsService {
	return &SettingsService{db: db}
}

// GetUserSettings retrieves user settings
func (s *SettingsService) GetUserSettings(ctx context.Context, userID string) (*dto.UserSettings, error) {
	id, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid user ID")
	}

	var settings model.UserSettings
	err = s.db.WithContext(ctx).Where("user_id = ?", id).First(&settings).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Return default settings if not found
			return s.getDefaultUserSettings(), nil
		}
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toUserSettingsDTO(&settings), nil
}

// UpdateUserSettings updates user settings
func (s *SettingsService) UpdateUserSettings(ctx context.Context, userID string, req *dto.UserSettingsUpdate) (*dto.UserSettings, error) {
	id, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid user ID")
	}

	// Validate settings
	if req.Display != nil {
		if req.Display.Theme != "" && !dto.IsValidTheme(req.Display.Theme) {
			return nil, errors.NewValidationError("Invalid theme value")
		}
		if req.Display.Language != "" && !dto.IsValidLanguage(req.Display.Language) {
			return nil, errors.NewValidationError("Invalid language value")
		}
		if req.Display.TablePageSize < 1 || req.Display.TablePageSize > 100 {
			return nil, errors.NewValidationError("Table page size must be between 1 and 100")
		}
	}

	var settings model.UserSettings
	err = s.db.WithContext(ctx).Where("user_id = ?", id).First(&settings).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new settings
			settings = model.UserSettings{
				UserID:               id,
				DisplaySettings:      model.DefaultDisplaySettings(),
				NotificationSettings: model.DefaultNotificationSettings(),
				AnalysisSettings:     model.DefaultAnalysisSettings(),
			}
		} else {
			return nil, errors.WrapDatabaseError(err)
		}
	}

	// Update fields
	if req.Display != nil {
		settings.DisplaySettings = model.JSON{
			"theme":         req.Display.Theme,
			"language":      req.Display.Language,
			"tablePageSize": req.Display.TablePageSize,
		}
	}
	if req.Notifications != nil {
		settings.NotificationSettings = model.JSON(req.Notifications)
	}
	if req.Analysis != nil {
		settings.AnalysisSettings = model.JSON(req.Analysis)
	}

	// Save settings
	if settings.ID == uuid.Nil {
		if err := s.db.WithContext(ctx).Create(&settings).Error; err != nil {
			return nil, errors.WrapDatabaseError(err)
		}
	} else {
		if err := s.db.WithContext(ctx).Save(&settings).Error; err != nil {
			return nil, errors.WrapDatabaseError(err)
		}
	}

	return s.toUserSettingsDTO(&settings), nil
}

// GetSystemConfig retrieves system configuration
func (s *SettingsService) GetSystemConfig(ctx context.Context, key string) (*dto.SystemConfig, error) {
	var config model.SystemConfig
	err := s.db.WithContext(ctx).Where("key = ?", key).First(&config).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("System config")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	return &dto.SystemConfig{
		Key:     config.Key,
		Value:   config.Value,
		Version: config.Version,
	}, nil
}

// UpdateSystemConfig updates system configuration
func (s *SettingsService) UpdateSystemConfig(ctx context.Context, key string, req *dto.SystemConfigUpdate) (*dto.SystemConfig, error) {
	var config model.SystemConfig
	err := s.db.WithContext(ctx).Where("key = ?", key).First(&config).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new config
			config = model.SystemConfig{
				Key:     key,
				Value:   model.JSON(req.Value),
				Version: 1,
			}
			if err := s.db.WithContext(ctx).Create(&config).Error; err != nil {
				return nil, errors.WrapDatabaseError(err)
			}
		} else {
			return nil, errors.WrapDatabaseError(err)
		}
	} else {
		// Update existing config
		config.Value = model.JSON(req.Value)
		config.Version++
		if err := s.db.WithContext(ctx).Save(&config).Error; err != nil {
			return nil, errors.WrapDatabaseError(err)
		}
	}

	return &dto.SystemConfig{
		Key:     config.Key,
		Value:   config.Value,
		Version: config.Version,
	}, nil
}

// getDefaultUserSettings returns default user settings
func (s *SettingsService) getDefaultUserSettings() *dto.UserSettings {
	return &dto.UserSettings{
		Display: dto.DisplaySettings{
			Theme:         "light",
			Language:      "zh-CN",
			TablePageSize: 20,
		},
		Notifications: map[string]interface{}{
			"emailEnabled": true,
			"pushEnabled":  false,
		},
		Analysis: map[string]interface{}{
			"defaultFilter": "all",
			"autoRefresh":   true,
		},
	}
}

// toUserSettingsDTO converts model to DTO
func (s *SettingsService) toUserSettingsDTO(settings *model.UserSettings) *dto.UserSettings {
	display := dto.DisplaySettings{
		Theme:         "light",
		Language:      "zh-CN",
		TablePageSize: 20,
	}

	if theme, ok := settings.DisplaySettings["theme"].(string); ok {
		display.Theme = theme
	}
	if lang, ok := settings.DisplaySettings["language"].(string); ok {
		display.Language = lang
	}
	if pageSize, ok := settings.DisplaySettings["tablePageSize"].(float64); ok {
		display.TablePageSize = int(pageSize)
	}

	return &dto.UserSettings{
		Display:       display,
		Notifications: settings.NotificationSettings,
		Analysis:      settings.AnalysisSettings,
	}
}
