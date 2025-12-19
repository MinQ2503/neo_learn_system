package auth

import (
	"mime/multipart"
	"net/http"
	"strconv"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *AuthService
}

func NewAuthHandler(authService *AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Register godoc
// @Summary Register a new user
// @Description Create a new user account
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.RegisterRequest true "Registration data"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	// Lấy avatar từ form-data (nếu có)
	var avatarFile *multipart.FileHeader
	file, err := c.FormFile("avatar")
	if err == nil {
		avatarFile = file
	}

	user, err := h.authService.Register(&req, avatarFile)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Registration successful",
		"data": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"profile": gin.H{
				"bio":       user.Profile.Bio,
				"phone":     user.Profile.Phone,
				"birth_day": user.Profile.BirthDay,
				"avatar":    user.Profile.Avatar,
			},
			"created_at": user.CreatedAt,
			"updatedAt":  user.UpdatedAt,
		},
	})
}

// Login godoc
// @Summary Login user
// @Description Authenticate user and return JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.LoginRequest true "Login credentials"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	response, err := h.authService.Login(&req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login successful",
		"data":    response,
	})
}

// GetProfile godoc
// @Summary Get user profile
// @Description Get current user profile information
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /auth/profile [get]
func (h *AuthHandler) GetProfile(c *gin.Context) {
	// 1️⃣ Lấy param (luôn là string)
	userIDParam := c.Param("user_id")
	if userIDParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "user_id is required",
		})
		return
	}

	// 2️⃣ Convert string -> int64
	userID, err := strconv.ParseInt(userIDParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "invalid user_id",
		})
		return
	}

	// 3️⃣ Call service
	userInfo, err := h.authService.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Profile retrieved successfully",
		"data":    userInfo,
	})
}

// ChangePassword godoc
// @Summary Change password
// @Description Change current user password
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.ChangePasswordRequest true "Password change data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/change-password [post]
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userIDParam := c.Param("user_id")
	// if !exists {
	// 	c.JSON(http.StatusUnauthorized, gin.H{
	// 		"success": false,
	// 		"message": "User not authenticated",
	// 	})
	// 	return
	// }

	if userIDParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "user_id is required",
		})
		return
	}

	userID, err := strconv.ParseInt(userIDParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "invalid user_id",
		})
		return
	}

	var req models.ChangePasswordRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	if err := h.authService.ChangePassword(userID, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password changed successfully",
	})
}

// Logout godoc
// @Summary Logout user
// @Description Logout current user (client should remove token)
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Router /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User not authenticated",
		})
		return
	}

	userInfo, err := h.authService.GetUserByID(userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve user info",
		})
		return
	}

	// In JWT, logout is handled on client side by removing the token
	// We return the user info so the client can display who logged out
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Logout successful",
		"data":    userInfo,
	})
}

func (h *AuthHandler) UploadAvatar(c *gin.Context) {
	// 1️⃣ Lấy user_id từ form-data
	userIDParam := c.Param("user_id")
	userID, err := strconv.ParseInt(userIDParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "invalid user_id",
		})
		return
	}

	// 2️⃣ Lấy file avatar từ form-data
	avatarFile, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "avatar file is required",
		})
		return
	}

	// 3️⃣ Cập nhật avatar thông qua service
	avatarURL, err := h.authService.UpdateAvatar(nil, userID, avatarFile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// 4️⃣ Trả về kết quả
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Avatar uploaded successfully",
		"data": gin.H{
			"avatar": avatarURL,
		},
	})
}
