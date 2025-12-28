package dto

// DisplaySettings represents user display preferences
type DisplaySettings struct {
	Theme         string `json:"theme"`
	Language      string `json:"language"`
	TablePageSize int    `json:"tablePageSize"`
}

// DefaultDisplaySettings returns the default display settings
func DefaultDisplaySettings() DisplaySettings {
	return DisplaySettings{
		Theme:         "light",
		Language:      "zh-CN",
		TablePageSize: 20,
	}
}

// UserSettings represents all user settings
type UserSettings struct {
	Display       DisplaySettings        `json:"display"`
	Notifications map[string]interface{} `json:"notifications"`
	Analysis      map[string]interface{} `json:"analysis"`
}

// DefaultUserSettings returns the default user settings
func DefaultUserSettings() UserSettings {
	return UserSettings{
		Display: DefaultDisplaySettings(),
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

// UserSettingsUpdate represents the request to update user settings
type UserSettingsUpdate struct {
	Display       *DisplaySettings        `json:"display"`
	Notifications map[string]interface{} `json:"notifications"`
	Analysis      map[string]interface{} `json:"analysis"`
}

// SystemConfig represents system-wide configuration
type SystemConfig struct {
	Key     string                 `json:"key"`
	Value   map[string]interface{} `json:"value"`
	Version int                    `json:"version"`
}

// SystemConfigUpdate represents the request to update system configuration
type SystemConfigUpdate struct {
	Value map[string]interface{} `json:"value" binding:"required"`
}

// ValidThemes contains the list of valid theme values
var ValidThemes = []string{"light", "dark", "system"}

// ValidLanguages contains the list of valid language values
var ValidLanguages = []string{"zh-CN", "en-US"}

// IsValidTheme checks if a theme value is valid
func IsValidTheme(theme string) bool {
	for _, t := range ValidThemes {
		if t == theme {
			return true
		}
	}
	return false
}

// IsValidLanguage checks if a language value is valid
func IsValidLanguage(lang string) bool {
	for _, l := range ValidLanguages {
		if l == lang {
			return true
		}
	}
	return false
}
