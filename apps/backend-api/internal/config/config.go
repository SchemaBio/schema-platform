package config

import (
	"time"

	"github.com/spf13/viper"
)

// Config holds all configuration for the application
type Config struct {
	Server    ServerConfig
	Database  DatabaseConfig
	JWT       JWTConfig
	RateLimit RateLimitConfig
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
	return "host=" + c.Host +
		" port=" + string(rune(c.Port)) +
		" user=" + c.User +
		" password=" + c.Password +
		" dbname=" + c.DBName +
		" sslmode=" + c.SSLMode
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

	// Database config
	config.Database.Host = viper.GetString("database.host")
	config.Database.Port = viper.GetInt("database.port")
	config.Database.User = viper.GetString("database.user")
	config.Database.Password = viper.GetString("database.password")
	config.Database.DBName = viper.GetString("database.dbname")
	config.Database.SSLMode = viper.GetString("database.sslmode")
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
}
