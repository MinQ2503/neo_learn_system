package profile

import (
	"net/http"
	"strconv"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type ProfileHandler struct {
	service *ProfileService
}

func NewProfileHandler(service *ProfileService) *ProfileHandler {
	return &ProfileHandler{service: service}
}

// GetProfile retrieves the profile of a user
// GET /api/profiles/:user_id
func (h *ProfileHandler) GetProfile(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user ID",
			"error":   err.Error(),
		})
		return
	}

	profile, err := h.service.GetProfileByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve profile",
			"error":   err.Error(),
		})
		return
	}

	if profile == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Profile not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Profile retrieved successfully",
		"data":    profile,
	})
}

// GetMyProfile retrieves the profile of the authenticated user
// GET /api/profiles/me
func (h *ProfileHandler) GetMyProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	profile, err := h.service.GetProfileByUserID(userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve profile",
			"error":   err.Error(),
		})
		return
	}

	if profile == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Profile not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Profile retrieved successfully",
		"data":    profile,
	})
}

// UpdateProfile updates the profile of a user
// PUT /api/profiles/:user_id
func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user ID",
			"error":   err.Error(),
		})
		return
	}

	// Check authorization: user can only update their own profile
	authenticatedUserID, exists := c.Get("user_id")
	if !exists || authenticatedUserID.(int64) != userID {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Cannot update another user's profile",
		})
		return
	}

	var profile models.Profile
	if err := c.ShouldBind(&profile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	profile.UserID = userID

	if err := h.service.CreateOrUpdateProfile(&profile); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update profile",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Profile updated successfully",
		"data":    profile,
	})
}

// UpdateMyProfile updates the profile of the authenticated user
// PUT /api/profiles/me
func (h *ProfileHandler) UpdateMyProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	var profile models.Profile
	if err := c.ShouldBind(&profile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	profile.UserID = userID.(int64)

	if err := h.service.CreateOrUpdateProfile(&profile); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update profile",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Profile updated successfully",
		"data":    profile,
	})
}
