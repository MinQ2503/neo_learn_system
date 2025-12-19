package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
}

type ServerConfig struct {
	Port    string
	GinMode string
}

type DatabaseConfig struct {
	Host      string
	Port      string
	User      string
	Password  string
	DBName    string
	DBAddress string
	SSLMode   string
}

type JWTConfig struct {
	Secret string
	// Expiration time.Duration
	ExpirationInSeconds time.Duration
}

var Envs = initConfig()

func initConfig() *Config {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	return &Config{
		Server: ServerConfig{
			Port:    getEnv("PORT", "8080"),
			GinMode: getEnv("GIN_MODE", "debug"),
		},
		Database: DatabaseConfig{
			Host:      getEnv("DB_HOST", "localhost"),
			Port:      getEnv("DB_PORT", "3306"),
			User:      getEnv("DB_USER", "neo_user"),
			Password:  getEnv("DB_PASSWORD", "NeoLearn@123"),
			DBName:    getEnv("DB_NAME", "neo_learn_system_db_main"),
			DBAddress: getEnv("DB_HOST", "localhost") + ":" + getEnv("DB_PORT", "3306"),
			SSLMode:   getEnv("DB_SSLMODE", "disable"),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "your_super_secret_key_change_this_in_production"),
			// Expiration: 24 * time.Hour, // 24 hours
			ExpirationInSeconds: time.Duration(getEnvAsInt("JWT_EXPIRATION_SECONDS", 3600*24*7)), // 24 hours
		},
	}
}

// Gets the env by key or fallbacks
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return fallback
}

func getEnvAsInt(key string, fallback int64) int64 {
	if value, ok := os.LookupEnv(key); ok {
		i, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			return fallback
		}

		return i
	}

	return fallback
}
