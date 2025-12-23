package quiz

import (
	"io"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// CheckUserHasImage checks if user has uploaded profile image
func (h *Handler) CheckUserHasImage(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	hasImage, err := h.service.CheckUserHasProfileImage(userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check profile image"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"has_profile_image": hasImage,
	})
}

// StartQuizAttempt starts a new quiz attempt
func (h *Handler) StartQuizAttempt(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Parse request body
	var req struct {
		QuizID int64 `json:"quiz_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Start attempt
	attempt, err := h.service.StartQuizAttempt(userID.(int64), req.QuizID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Quiz attempt started successfully",
		"attempt": attempt,
	})
}

// SubmitFrame submits a frame for cheating detection
func (h *Handler) SubmitFrame(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get attempt ID from form
	attemptIDStr := c.PostForm("attempt_id")
	if attemptIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "attempt_id is required"})
		return
	}

	attemptID, err := strconv.ParseInt(attemptIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attempt_id"})
		return
	}

	// Get file from form
	fileHeader, err := c.FormFile("frame")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get frame file"})
		return
	}

	// Open file
	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}
	defer file.Close()

	// Read file data
	fileData, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
		return
	}

	// Submit to anti-cheating service
	result, err := h.service.SubmitFrame(attemptID, userID.(int64), fileData, fileHeader.Filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetViolationCount returns the violation count for an attempt
func (h *Handler) GetViolationCount(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get attempt ID from query parameter
	attemptIDStr := c.Query("attempt_id")
	if attemptIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "attempt_id is required"})
		return
	}

	attemptID, err := strconv.ParseInt(attemptIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attempt_id"})
		return
	}

	// Verify user owns this attempt
	attempt, err := h.service.repo.GetQuizAttemptByID(attemptID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Attempt not found"})
		return
	}

	if attempt.UserID != userID.(int64) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: attempt does not belong to user"})
		return
	}

	// Get violation count
	count, err := h.service.GetViolationCount(attemptID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get violation count"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"attempt_id":      attemptID,
		"violation_count": count,
	})
}
