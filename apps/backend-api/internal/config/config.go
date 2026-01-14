package config

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/spf13/viper"
)

// Config holds all configuration for the application
type Config struct {
	Server    ServerConfig
	Database  DatabaseConfig
	JWT       JWTConfig
	RateLimit RateLimitConfig
	Features  FeatureConfig
	Admin     AdminConfig
}

// AdminConfig holds default admin user configuration
type AdminConfig struct {
	Email    string
	Name     string
	Password string
	Enabled  bool
}

// FeatureConfig holds feature flags
type FeatureConfig struct {
	AllowPublicRegistration     bool
	RequireEmailVerification    bool
	PasswordExpiryDays          int
}

// ServerConfig holds server-related configuration
type ServerConfig struct {
	Host string
	Port int
	Mode string // debug, release, test
}

// DatabaseConfig holds database-related configuration
type DatabaseConfig struct {
	Host         string
	Port         int
	User         string
	Password     string
	DBName       string
	SSLMode      string
	MaxIdleConns int
	MaxOpenConns int
	MaxLifetime  time.Duration
}

// JWTConfig holds JWT-related configuration
type JWTConfig struct {
	Secret           string
	AccessExpiresIn  time.Duration
	RefreshExpiresIn time.Duration
	Issuer           string
}

// RateLimitConfig holds rate limiting configuration
type RateLimitConfig struct {
	RequestsPerSecond float64
	Burst             int
}

// DSN returns the PostgreSQL connection string
func (c *DatabaseConfig) DSN() string {
	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode)
}

// ParseDSN parses a PostgreSQL DSN string and populates the config
// Expected format: postgresql://user:password@host:port/dbname?sslmode=mode
func (c *DatabaseConfig) ParseDSN(dsn string) error {
	// Simple parsing - remove prefix
	dsn = strings.TrimPrefix(dsn, "postgresql://")

	// Parse user:password@
	atIndex := strings.Index(dsn, "@")
	if atIndex == -1 {
		return fmt.Errorf("invalid DSN format: missing @")
	}

	credentials := dsn[:atIndex]
	rest := dsn[atIndex+1:]

	// Parse credentials
	colonIndex := strings.Index(credentials, ":")
	if colonIndex == -1 {
		return fmt.Errorf("invalid DSN format: missing password")
	}
	c.User = credentials[:colonIndex]
	c.Password = credentials[colonIndex+1:]

	// Parse host:port/dbname?params
	slashIndex := strings.Index(rest, "/")
	if slashIndex == -1 {
		return fmt.Errorf("invalid DSN format: missing database name")
	}

	hostPort := rest[:slashIndex]
	queryParams := rest[slashIndex+1:]

	// Parse host:port
	colonIndex = strings.Index(hostPort, ":")
	if colonIndex == -1 {
		c.Host = hostPort
		c.Port = 5432 // default PostgreSQL port
	} else {
		c.Host = hostPort[:colonIndex]
		port, err := strconv.Atoi(hostPort[colonIndex+1:])
		if err != nil {
			return fmt.Errorf("invalid port number: %s", hostPort[colonIndex+1:])
		}
		c.Port = port
	}

	// Parse database name and params
	semicolonIndex := strings.Index(queryParams, "?")
	if semicolonIndex == -1 {
		c.DBName = queryParams
		c.SSLMode = "require"
	} else {
		c.DBName = queryParams[:semicolonIndex]
		params := queryParams[semicolonIndex+1:]
		// Parse params
		for _, param := range strings.Split(params, "&") {
			kv := strings.SplitN(param, "=", 2)
			if len(kv) == 2 && kv[0] == "sslmode" {
				c.SSLMode = kv[1]
				break
			}
		}
	}

	return nil
}

// Load loads configuration from file and environment variables
func Load() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")
	viper.AddConfigPath("/etc/backend-api")

	// Set defaults
	setDefaults()

	// Read environment variables
	viper.AutomaticEnv()
	viper.SetEnvPrefix("SCHEMA")

	// Try to read config file (optional)
	_ = viper.ReadInConfig()

	config := &Config{}

	// Server config
	config.Server.Host = viper.GetString("server.host")
	config.Server.Port = viper.GetInt("server.port")
	config.Server.Mode = viper.GetString("server.mode")

	// Database config - support DSN format
	dsn := viper.GetString("database.dsn")
	if dsn != "" {
		if err := config.Database.ParseDSN(dsn); err != nil {
			return nil, fmt.Errorf("failed to parse database DSN: %w", err)
		}
	} else {
		config.Database.Host = viper.GetString("database.host")
		config.Database.Port = viper.GetInt("database.port")
		config.Database.User = viper.GetString("database.user")
		config.Database.Password = viper.GetString("database.password")
		config.Database.DBName = viper.GetString("database.dbname")
		config.Database.SSLMode = viper.GetString("database.sslmode")
	}
	config.Database.MaxIdleConns = viper.GetInt("database.max_idle_conns")
	config.Database.MaxOpenConns = viper.GetInt("database.max_open_conns")
	config.Database.MaxLifetime = viper.GetDuration("database.max_lifetime")

	// JWT config
	config.JWT.Secret = viper.GetString("jwt.secret")
	config.JWT.AccessExpiresIn = viper.GetDuration("jwt.access_expires_in")
	config.JWT.RefreshExpiresIn = viper.GetDuration("jwt.refresh_expires_in")
	config.JWT.Issuer = viper.GetString("jwt.issuer")

	// Rate limit config
	config.RateLimit.RequestsPerSecond = viper.GetFloat64("ratelimit.requests_per_second")
	config.RateLimit.Burst = viper.GetInt("ratelimit.burst")

	// Feature flags
	config.Features.AllowPublicRegistration = viper.GetBool("features.allow_public_registration")
	config.Features.RequireEmailVerification = viper.GetBool("features.require_email_verification")
	config.Features.PasswordExpiryDays = viper.GetInt("features.password_expiry_days")

	// Admin config
	config.Admin.Email = viper.GetString("admin.email")
	config.Admin.Name = viper.GetString("admin.name")
	config.Admin.Password = viper.GetString("admin.password")
	config.Admin.Enabled = viper.GetBool("admin.enabled")

	return config, nil
}

func setDefaults() {
	// Server defaults
	viper.SetDefault("server.host", "0.0.0.0")
	viper.SetDefault("server.port", 8080)
	viper.SetDefault("server.mode", "debug")

	// Database defaults
	viper.SetDefault("database.host", "localhost")
	viper.SetDefault("database.port", 5432)
	viper.SetDefault("database.user", "postgres")
	viper.SetDefault("database.password", "postgres")
	viper.SetDefault("database.dbname", "schema_platform")
	viper.SetDefault("database.sslmode", "disable")
	viper.SetDefault("database.max_idle_conns", 10)
	viper.SetDefault("database.max_open_conns", 100)
	viper.SetDefault("database.max_lifetime", time.Hour)

	// JWT defaults
	viper.SetDefault("jwt.secret", "change-me-in-production")
	viper.SetDefault("jwt.access_expires_in", 15*time.Minute)
	viper.SetDefault("jwt.refresh_expires_in", 7*24*time.Hour)
	viper.SetDefault("jwt.issuer", "schema-platform")

	// Rate limit defaults
	viper.SetDefault("ratelimit.requests_per_second", 100.0)
	viper.SetDefault("ratelimit.burst", 200)

	// Feature defaults
	viper.SetDefault("features.allow_public_registration", true)
	viper.SetDefault("features.require_email_verification", false)
	viper.SetDefault("features.password_expiry_days", 0) // 0 = no expiry

	// Admin defaults
	viper.SetDefault("admin.email", "admin@schema.local")
	viper.SetDefault("admin.name", "System Administrator")
	viper.SetDefault("admin.password", "Admin123!")
	viper.SetDefault("admin.enabled", true)
}
