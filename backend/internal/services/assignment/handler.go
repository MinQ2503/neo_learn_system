package assignment

import (
	"net/http"
	"strconv"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type AssignmentHandler struct {
	service *AssignmentService
}

func NewAssignmentHandler(service *AssignmentService) *AssignmentHandler {
	return &AssignmentHandler{service: service}
}

// CreateAssignment creates a new assignment
// POST /api/courses/:course_id/assignments
func (h *AssignmentHandler) CreateAssignment(c *gin.Context) {
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

	var assignment models.Assignment
	if err := c.ShouldBind(&assignment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	assignment.CourseID = courseID

	if err := h.service.CreateAssignment(&assignment, userID.(int64)); err != nil {
		if err == ErrUnauthorized {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You don't have permission to create assignments in this course",
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
			"message": "Failed to create assignment",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Assignment created successfully",
		"data":    assignment,
	})
}

// GetAssignment retrieves an assignment by ID
// GET /api/assignments/:id
func (h *AssignmentHandler) GetAssignment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid assignment ID",
			"error":   err.Error(),
		})
		return
	}

	assignment, err := h.service.GetAssignment(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve assignment",
			"error":   err.Error(),
		})
		return
	}

	if assignment == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Assignment not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Assignment retrieved successfully",
		"data":    assignment,
	})
}

// GetAssignmentsByCourse retrieves all assignments for a course
// GET /api/courses/:course_id/assignments
func (h *AssignmentHandler) GetAssignmentsByCourse(c *gin.Context) {
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

	assignments, err := h.service.GetAssignmentsByCourse(courseID)
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
			"message": "Failed to retrieve assignments",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Assignments retrieved successfully",
		"data":    assignments,
	})
}

// UpdateAssignment updates an assignment
// PUT /api/assignments/:id
func (h *AssignmentHandler) UpdateAssignment(c *gin.Context) {
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
			"message": "Invalid assignment ID",
			"error":   err.Error(),
		})
		return
	}

	var assignment models.Assignment
	if err := c.ShouldBind(&assignment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	assignment.ID = id

	if err := h.service.UpdateAssignment(&assignment, userID.(int64)); err != nil {
		if err == ErrUnauthorized {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You don't have permission to update this assignment",
			})
			return
		}
		if err == ErrAssignmentNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Assignment not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update assignment",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Assignment updated successfully",
		"data":    assignment,
	})
}

// DeleteAssignment deletes an assignment
// DELETE /api/assignments/:id
func (h *AssignmentHandler) DeleteAssignment(c *gin.Context) {
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
			"message": "Invalid assignment ID",
			"error":   err.Error(),
		})
		return
	}

	if err := h.service.DeleteAssignment(id, userID.(int64)); err != nil {
		if err == ErrUnauthorized {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You don't have permission to delete this assignment",
			})
			return
		}
		if err == ErrAssignmentNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Assignment not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete assignment",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Assignment deleted successfully",
	})
}

// SubmitAssignment submits an assignment
// POST /api/assignments/:id/submit
func (h *AssignmentHandler) SubmitAssignment(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	idStr := c.Param("id")
	assignmentID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid assignment ID",
			"error":   err.Error(),
		})
		return
	}

	var submission models.AssignmentSubmission
	if err := c.ShouldBind(&submission); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	submission.AssignmentID = assignmentID

	if err := h.service.SubmitAssignment(&submission, userID.(int64)); err != nil {
		if err == ErrDeadlinePassed {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Assignment deadline has passed",
			})
			return
		}
		if err == ErrNotYetStarted {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Assignment has not started yet",
			})
			return
		}
		if err == ErrUnauthorized {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You are not enrolled in this course",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to submit assignment",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Assignment submitted successfully",
		"data":    submission,
	})
}

// GetMySubmission retrieves the authenticated student's submission
// GET /api/assignments/:id/my-submission
func (h *AssignmentHandler) GetMySubmission(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	idStr := c.Param("id")
	assignmentID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid assignment ID",
			"error":   err.Error(),
		})
		return
	}

	submission, err := h.service.GetMySubmission(assignmentID, userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve submission",
			"error":   err.Error(),
		})
		return
	}

	if submission == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Submission not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Submission retrieved successfully",
		"data":    submission,
	})
}

// GetSubmissionsByAssignment retrieves all submissions for an assignment (instructor only)
// GET /api/assignments/:id/submissions
func (h *AssignmentHandler) GetSubmissionsByAssignment(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	idStr := c.Param("id")
	assignmentID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid assignment ID",
			"error":   err.Error(),
		})
		return
	}

	submissions, err := h.service.GetSubmissionsByAssignment(assignmentID, userID.(int64))
	if err != nil {
		if err == ErrUnauthorized {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You don't have permission to view submissions",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve submissions",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Submissions retrieved successfully",
		"data":    submissions,
	})
}

// GradeSubmission grades a submission (instructor only)
// POST /api/submissions/:id/grade
func (h *AssignmentHandler) GradeSubmission(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	idStr := c.Param("id")
	submissionID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid submission ID",
			"error":   err.Error(),
		})
		return
	}

	var gradeRequest struct {
		Score    int    `json:"score" binding:"required"`
		Feedback string `json:"feedback"`
	}

	if err := c.ShouldBind(&gradeRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	if err := h.service.GradeSubmission(submissionID, gradeRequest.Score, gradeRequest.Feedback, userID.(int64)); err != nil {
		if err == ErrUnauthorized {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "You don't have permission to grade this submission",
			})
			return
		}
		if err == ErrSubmissionNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Submission not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to grade submission",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Submission graded successfully",
	})
}
