package api

import (
	"database/sql"
	"log"
	"time"

	config "github.com/MinQ2503/neo_learn_system/backend/configs"
	"github.com/MinQ2503/neo_learn_system/backend/internal/services/auth"
	"github.com/MinQ2503/neo_learn_system/backend/internal/services/user"
	"github.com/MinQ2503/neo_learn_system/backend/internal/utils"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type APIServer struct {
	addr string
	db   *sql.DB
}

func NewAPIServer(addr string, db *sql.DB) *APIServer {
	return &APIServer{
		addr: addr,
		db:   db,
	}
}

func (s *APIServer) Run() error {
	// Set Gin mode
	gin.SetMode(config.Envs.Server.GinMode)

	// Initialize JWT secret
	utils.SetJWTSecret(config.Envs.JWT.Secret)

	// Create Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Initialize auth service
	userRepo := auth.NewUserRepository(s.db)
	authService := auth.NewAuthService(userRepo, time.Second*config.Envs.JWT.ExpirationInSeconds)
	authHandler := auth.NewAuthHandler(authService)

	// Initialize user service (for student management)
	studentRepo := user.NewUserRepository(s.db)
	studentService := user.NewUserService(studentRepo)
	studentHandler := user.NewUserHandler(studentService)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Auth routes
		authRoutes := v1.Group("/auth")
		{
			authRoutes.POST("/register", authHandler.Register)
			authRoutes.POST("/login", authHandler.Login)

			// Protected routes
			protected := authRoutes.Group("")
			protected.Use(auth.AuthMiddleware())
			{
				protected.GET("/profile", authHandler.GetProfile)
				protected.POST("/change-password", authHandler.ChangePassword)
				protected.POST("/logout", authHandler.Logout)
			}
		}

		// Student management routes (Teacher only)
		studentRoutes := v1.Group("/students")
		studentRoutes.Use(auth.AuthMiddleware())
		studentRoutes.Use(auth.RoleMiddleware("teacher"))
		{
			studentRoutes.POST("", studentHandler.CreateStudent)
			studentRoutes.GET("", studentHandler.GetStudents)
			studentRoutes.GET("/:id", studentHandler.GetStudent)
			studentRoutes.PUT("/:id", studentHandler.UpdateStudent)
			studentRoutes.DELETE("/:id", studentHandler.DeleteStudent)
		}
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Server is running",
		})
	})

	// Serve static files
	router.Static("/static", "./static")

	log.Printf("Server starting on %s in %s mode", s.addr, config.Envs.Server.GinMode)
	return router.Run(s.addr)
}
