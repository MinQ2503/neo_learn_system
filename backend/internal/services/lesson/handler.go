package lesson

import (
	"net/http"
	"strconv"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type LessonHandler struct {
	service *LessonService
}

func NewLessonHandler(service *LessonService) *LessonHandler {
	return &LessonHandler{service: service}
}

// CreateLesson creates a new lesson
// POST /api/courses/:course_id/lessons
func (h *LessonHandler) CreateLesson(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	courseIDStr := c.Param("course_id")
	courseID, err := strconv.ParseInt(courseIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid course ID",
			"error":   err.Error(),
		})
		return
	}

	var lesson models.Lesson
	if err := c.ShouldBind(&lesson); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	lesson.CourseID = courseID

	if err := h.service.CreateLesson(&lesson, userID.(int64)); err != nil {
		if err == ErrUnauthorized {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You don't have permission to create lessons in this course",
			})
			return
		}
		if err == ErrCourseNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Course not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create lesson",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Lesson created successfully",
		"data":    lesson,
	})
}

// GetLesson retrieves a lesson by ID
// GET /api/lessons/:id
func (h *LessonHandler) GetLesson(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid lesson ID",
			"error":   err.Error(),
		})
		return
	}

	lesson, err := h.service.GetLesson(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve lesson",
			"error":   err.Error(),
		})
		return
	}

	if lesson == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Lesson not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Lesson retrieved successfully",
		"data":    lesson,
	})
}

// GetLessonsByCourse retrieves all lessons for a course
// GET /api/courses/:course_id/lessons
func (h *LessonHandler) GetLessonsByCourse(c *gin.Context) {
	courseIDStr := c.Param("course_id")
	courseID, err := strconv.ParseInt(courseIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid course ID",
			"error":   err.Error(),
		})
		return
	}

	lessons, err := h.service.GetLessonsByCourse(courseID)
	if err != nil {
		if err == ErrCourseNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Course not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve lessons",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Lessons retrieved successfully",
		"data":    lessons,
	})
}

// UpdateLesson updates a lesson
// PUT /api/lessons/:id
func (h *LessonHandler) UpdateLesson(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid lesson ID",
			"error":   err.Error(),
		})
		return
	}

	var lesson models.Lesson
	if err := c.ShouldBind(&lesson); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	lesson.ID = id

	if err := h.service.UpdateLesson(&lesson, userID.(int64)); err != nil {
		if err == ErrUnauthorized {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You don't have permission to update this lesson",
			})
			return
		}
		if err == ErrLessonNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Lesson not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update lesson",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Lesson updated successfully",
		"data":    lesson,
	})
}

// DeleteLesson deletes a lesson
// DELETE /api/lessons/:id
func (h *LessonHandler) DeleteLesson(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid lesson ID",
			"error":   err.Error(),
		})
		return
	}

	if err := h.service.DeleteLesson(id, userID.(int64)); err != nil {
		if err == ErrUnauthorized {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You don't have permission to delete this lesson",
			})
			return
		}
		if err == ErrLessonNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Lesson not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete lesson",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Lesson deleted successfully",
	})
}
