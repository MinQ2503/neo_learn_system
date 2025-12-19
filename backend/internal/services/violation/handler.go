package violation

import (
	"net/http"
	"strconv"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type ViolationHandler struct {
	service *ViolationService
}

func NewViolationHandler(service *ViolationService) *ViolationHandler {
	return &ViolationHandler{service: service}
}

// CreateViolation handles POST /api/v1/violations
func (h *ViolationHandler) CreateViolation(c *gin.Context) {
	var req models.CreateViolationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	violation, err := h.service.CreateViolation(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":   "Violation created successfully",
		"violation": violation,
	})
}

// CreateViolationsBatch handles POST /api/v1/violations/batch
func (h *ViolationHandler) CreateViolationsBatch(c *gin.Context) {
	var requests []models.CreateViolationRequest
	if err := c.ShouldBindJSON(&requests); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	violations, err := h.service.CreateViolationsBatch(requests)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Violations created successfully",
		"violations": violations,
		"count":      len(violations),
	})
}

// GetViolationsByAttemptID handles GET /api/v1/violations/attempt/:attempt_id
func (h *ViolationHandler) GetViolationsByAttemptID(c *gin.Context) {
	attemptIDStr := c.Param("attempt_id")
	attemptID, err := strconv.ParseInt(attemptIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attempt ID"})
		return
	}

	violations, err := h.service.GetViolationsByAttemptID(attemptID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       violations,
		"count":      len(violations),
		"attempt_id": attemptID,
	})
}

// GetViolationByID handles GET /api/v1/violations/:id
func (h *ViolationHandler) GetViolationByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid violation ID"})
		return
	}

	violation, err := h.service.GetViolationByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if violation == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Violation not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": violation})
}

// CountViolationsByAttemptID handles GET /api/v1/violations/attempt/:attempt_id/count
func (h *ViolationHandler) CountViolationsByAttemptID(c *gin.Context) {
	attemptIDStr := c.Param("attempt_id")
	attemptID, err := strconv.ParseInt(attemptIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attempt ID"})
		return
	}

	count, err := h.service.CountViolationsByAttemptID(attemptID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"attempt_id": attemptID,
		"count":      count,
	})
}
