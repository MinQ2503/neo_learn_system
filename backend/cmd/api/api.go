package api

import (
	"database/sql"
	"log"
	"time"

	config "github.com/MinQ2503/neo_learn_system/backend/configs"
	"github.com/MinQ2503/neo_learn_system/backend/internal/services/anti_cheating"
	"github.com/MinQ2503/neo_learn_system/backend/internal/services/auth"
	"github.com/MinQ2503/neo_learn_system/backend/internal/services/question_bank"
	"github.com/MinQ2503/neo_learn_system/backend/internal/services/quiz"
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

	// Initialize anti-cheating service client
	antiCheatingClient := anti_cheating.NewAntiCheatingClient(config.Envs.AntiCheating.ServiceURL)

	// Initialize auth service
	userRepo := auth.NewUserRepository(s.db)
	authService := auth.NewAuthService(userRepo, time.Second*config.Envs.JWT.ExpirationInSeconds)
	authHandler := auth.NewAuthHandler(authService, antiCheatingClient)

	// Initialize user service (for user management)
	userRepoV2 := user.NewUserRepository(s.db)
	userService := user.NewUserService(userRepoV2)
	userHandler := user.NewUserHandler(userService)

	// Initialize question bank service
	questionRepo := question_bank.NewQuestionRepository(s.db)
	questionService := question_bank.NewQuestionService(questionRepo)
	questionHandler := question_bank.NewQuestionHandler(questionService)

	// Initialize quiz service
	quizRepo := quiz.NewRepository(s.db)
	quizService := quiz.NewService(quizRepo, config.Envs.AntiCheating.ServiceURL)
	quizHandler := quiz.NewHandler(quizService)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Auth routes
		authRoutes := v1.Group("/auth")
		{
			authRoutes.POST("/register", authHandler.Register)
			authRoutes.POST("/login", authHandler.Login)
			authRoutes.GET("/profile/:user_id", authHandler.GetProfile)
			authRoutes.POST("/change-password/:user_id", authHandler.ChangePassword)
			authRoutes.POST("/update-avatar/:user_id", authHandler.UploadAvatar)

			// Protected routes
			protected := authRoutes.Group("")
			protected.Use(auth.AuthMiddleware())
			{
				// protected.GET("/profile", authHandler.GetProfile)
				// protected.POST("/change-password", authHandler.ChangePassword)
				protected.POST("/logout", authHandler.Logout)
			}
		}

		// User common routes
		userRoutes := v1.Group("/users")
		userRoutes.Use(auth.AuthMiddleware())
		{
			// userRoutes.POST("/upload-avatar", userHandler.UploadProfileImage)
		}

		// Student management routes
		studentRoutes := v1.Group("/students")
		studentRoutes.Use(auth.AuthMiddleware())

		// Routes for Admin and Instructor (Create, List, Delete)
		manageRoutes := studentRoutes.Group("")
		manageRoutes.Use(auth.RoleMiddleware("admin", "instructor"))
		{
			manageRoutes.POST("", userHandler.CreateStudent)
			manageRoutes.GET("", userHandler.GetStudents)
			manageRoutes.DELETE("/:id", userHandler.DeleteStudent)
		}

		// Routes for Admin, Instructor and Student (Get, Update)
		// Logic in handler will ensure students can only access their own data
		commonRoutes := studentRoutes.Group("")
		commonRoutes.Use(auth.RoleMiddleware("admin", "instructor", "student"))
		{
			commonRoutes.GET("/:id", userHandler.GetStudent)
			commonRoutes.PUT("/:id", userHandler.UpdateStudent)
		}

		// Instructor management routes
		instructorRoutes := v1.Group("/instructors")
		instructorRoutes.Use(auth.AuthMiddleware())

		// Admin only for Create, List, Delete
		instructorManageRoutes := instructorRoutes.Group("")
		instructorManageRoutes.Use(auth.RoleMiddleware("admin"))
		{
			instructorManageRoutes.POST("", userHandler.CreateInstructor)
			instructorManageRoutes.GET("", userHandler.GetInstructors)
			instructorManageRoutes.DELETE("/:id", userHandler.DeleteInstructor)
		}

		// Admin and Instructor (self) for Get, Update
		instructorCommonRoutes := instructorRoutes.Group("")
		instructorCommonRoutes.Use(auth.RoleMiddleware("admin", "instructor"))
		{
			instructorCommonRoutes.GET("/:id", userHandler.GetInstructor)
			instructorCommonRoutes.PUT("/:id", userHandler.UpdateInstructor)
		}

		// Admin management routes
		adminRoutes := v1.Group("/admins")
		adminRoutes.Use(auth.AuthMiddleware())
		adminRoutes.Use(auth.RoleMiddleware("admin"))
		{
			adminRoutes.POST("", userHandler.CreateAdmin)
			adminRoutes.GET("", userHandler.GetAdmins)
			adminRoutes.GET("/:id", userHandler.GetAdmin)
			adminRoutes.PUT("/:id", userHandler.UpdateAdmin)
			adminRoutes.DELETE("/:id", userHandler.DeleteAdmin)
		}

		// Question Bank routes
		questionRoutes := v1.Group("/questions")
		questionRoutes.Use(auth.AuthMiddleware())
		questionRoutes.Use(auth.RoleMiddleware("admin", "teacher"))
		{
			questionRoutes.POST("", questionHandler.CreateQuestion)
			questionRoutes.GET("", questionHandler.GetAllQuestions)
			questionRoutes.DELETE("", questionHandler.DeleteQuestions)
			questionRoutes.GET("/:id", questionHandler.GetQuestion)
			questionRoutes.PUT("/:id", questionHandler.UpdateQuestion)
			questionRoutes.DELETE("/:id", questionHandler.DeleteQuestion)
		}

		// Quiz routes
		quizRoutes := v1.Group("/quiz")
		quizRoutes.Use(auth.AuthMiddleware())
		{
			// Check if user has profile image (all authenticated users)
			quizRoutes.GET("/check-profile-image", quizHandler.CheckUserHasImage)

			// Start quiz attempt (student only)
			quizRoutes.POST("/attempts/start", quizHandler.StartQuizAttempt)

			// Submit frame during quiz (student only)
			quizRoutes.POST("/attempts/submit-frame", quizHandler.SubmitFrame)

			// Get violation count
			quizRoutes.GET("/attempts/violations", quizHandler.GetViolationCount)
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
	router.Static("/images", "./internal/database/images")

	log.Printf("Server starting on %s in %s mode", s.addr, config.Envs.Server.GinMode)
	return router.Run(s.addr)
}
