package course

import (
	"net/http"
	"strconv"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type CourseHandler struct {
	service *CourseService
}

func NewCourseHandler(service *CourseService) *CourseHandler {
	return &CourseHandler{service: service}
}

// CreateCourse creates a new course
// POST /api/courses
func (h *CourseHandler) CreateCourse(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	var course models.Course
	if err := c.ShouldBind(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	course.UserID = userID.(int64)

	if err := h.service.CreateCourse(&course); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create course",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Course created successfully",
		"data":    course,
	})
}

// GetCourse retrieves a course by ID
// GET /api/courses/:id
func (h *CourseHandler) GetCourse(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid course ID",
			"error":   err.Error(),
		})
		return
	}

	course, err := h.service.GetCourse(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve course",
			"error":   err.Error(),
		})
		return
	}

	if course == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Course not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course retrieved successfully",
		"data":    course,
	})
}

// GetAllCourses retrieves all courses
// GET /api/courses
func (h *CourseHandler) GetAllCourses(c *gin.Context) {
	courses, err := h.service.GetAllCourses()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve courses",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Courses retrieved successfully",
		"data":    courses,
	})
}

// GetMyCourses retrieves all courses created by the authenticated instructor
// GET /api/courses/my-courses
func (h *CourseHandler) GetMyCourses(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	courses, err := h.service.GetCoursesByInstructor(userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve courses",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Courses retrieved successfully",
		"data":    courses,
	})
}

// GetEnrolledCourses retrieves all courses the authenticated student is enrolled in
// GET /api/courses/enrolled
func (h *CourseHandler) GetEnrolledCourses(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	courses, err := h.service.GetEnrolledCourses(userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve enrolled courses",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Enrolled courses retrieved successfully",
		"data":    courses,
	})
}

// UpdateCourse updates a course
// PUT /api/courses/:id
func (h *CourseHandler) UpdateCourse(c *gin.Context) {
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
			"message": "Invalid course ID",
			"error":   err.Error(),
		})
		return
	}

	var course models.Course
	if err := c.ShouldBind(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	course.ID = id

	if err := h.service.UpdateCourse(&course, userID.(int64)); err != nil {
		if err == ErrUnauthorized {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You don't have permission to update this course",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update course",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course updated successfully",
		"data":    course,
	})
}

// DeleteCourse deletes a course
// DELETE /api/courses/:id
func (h *CourseHandler) DeleteCourse(c *gin.Context) {
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
			"message": "Invalid course ID",
			"error":   err.Error(),
		})
		return
	}

	if err := h.service.DeleteCourse(id, userID.(int64)); err != nil {
		if err == ErrUnauthorized {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You don't have permission to delete this course",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete course",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Course deleted successfully",
	})
}

// EnrollStudent enrolls a student in a course
// POST /api/courses/:id/enroll
func (h *CourseHandler) EnrollStudent(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	idStr := c.Param("id")
	courseID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid course ID",
			"error":   err.Error(),
		})
		return
	}

	if err := h.service.EnrollStudent(courseID, userID.(int64)); err != nil {
		if err == ErrAlreadyEnrolled {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "Already enrolled in this course",
			})
			return
		}
		if err == ErrCannotEnrollOwnCourse {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Cannot enroll in your own course",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to enroll in course",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Enrolled successfully",
	})
}

// UnenrollStudent removes a student from a course
// POST /api/courses/:id/unenroll
func (h *CourseHandler) UnenrollStudent(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	idStr := c.Param("id")
	courseID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid course ID",
			"error":   err.Error(),
		})
		return
	}

	if err := h.service.UnenrollStudent(courseID, userID.(int64)); err != nil {
		if err == ErrNotEnrolled {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Not enrolled in this course",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to unenroll from course",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Unenrolled successfully",
	})
}

// GetEnrolledStudents retrieves all students enrolled in a course
// GET /api/courses/:id/students
func (h *CourseHandler) GetEnrolledStudents(c *gin.Context) {
	idStr := c.Param("id")
	courseID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid course ID",
			"error":   err.Error(),
		})
		return
	}

	students, err := h.service.GetEnrolledStudents(courseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve enrolled students",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Enrolled students retrieved successfully",
		"data":    students,
	})
}
