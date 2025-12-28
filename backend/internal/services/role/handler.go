package role

import (
	"net/http"
	"strconv"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type RoleHandler struct {
	service *RoleService
}

func NewRoleHandler(service *RoleService) *RoleHandler {
	return &RoleHandler{service: service}
}

// ========== Role Handlers ==========

// CreateRole creates a new role (admin only)
// POST /api/roles
func (h *RoleHandler) CreateRole(c *gin.Context) {
	var role models.Role
	if err := c.ShouldBind(&role); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	if err := h.service.CreateRole(&role); err != nil {
		if err == ErrRoleExists {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "Role already exists",
				"error":   err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create role",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Role created successfully",
		"data":    role,
	})
}

// GetRole retrieves a role by ID
// GET /api/roles/:id
func (h *RoleHandler) GetRole(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid role ID",
			"error":   err.Error(),
		})
		return
	}

	role, err := h.service.GetRole(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve role",
			"error":   err.Error(),
		})
		return
	}

	if role == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Role not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Role retrieved successfully",
		"data":    role,
	})
}

// GetAllRoles retrieves all roles
// GET /api/roles
func (h *RoleHandler) GetAllRoles(c *gin.Context) {
	roles, err := h.service.GetAllRoles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve roles",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Roles retrieved successfully",
		"data":    roles,
	})
}

// ========== Permission Handlers ==========

// CreatePermission creates a new permission (admin only)
// POST /api/permissions
func (h *RoleHandler) CreatePermission(c *gin.Context) {
	var permission models.Permission
	if err := c.ShouldBind(&permission); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	if err := h.service.CreatePermission(&permission); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create permission",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Permission created successfully",
		"data":    permission,
	})
}

// GetAllPermissions retrieves all permissions
// GET /api/permissions
func (h *RoleHandler) GetAllPermissions(c *gin.Context) {
	permissions, err := h.service.GetAllPermissions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve permissions",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Permissions retrieved successfully",
		"data":    permissions,
	})
}

// ========== Role-Permission Handlers ==========

// AssignPermissionToRole assigns a permission to a role (admin only)
// POST /api/roles/:role_id/permissions/:permission_id
func (h *RoleHandler) AssignPermissionToRole(c *gin.Context) {
	roleIDStr := c.Param("role_id")
	roleID, err := strconv.ParseInt(roleIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid role ID",
			"error":   err.Error(),
		})
		return
	}

	permissionIDStr := c.Param("permission_id")
	permissionID, err := strconv.ParseInt(permissionIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid permission ID",
			"error":   err.Error(),
		})
		return
	}

	if err := h.service.AssignPermissionToRole(roleID, permissionID); err != nil {
		if err == ErrRoleNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Role not found",
				"error":   err.Error(),
			})
			return
		}
		if err == ErrPermissionNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Permission not found",
				"error":   err.Error(),
			})
			return
		}
		if err == ErrAlreadyAssigned {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "Permission already assigned to role",
				"error":   err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to assign permission to role",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Permission assigned to role successfully",
	})
}

// RemovePermissionFromRole removes a permission from a role (admin only)
// DELETE /api/roles/:role_id/permissions/:permission_id
func (h *RoleHandler) RemovePermissionFromRole(c *gin.Context) {
	roleIDStr := c.Param("role_id")
	roleID, err := strconv.ParseInt(roleIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid role ID",
			"error":   err.Error(),
		})
		return
	}

	permissionIDStr := c.Param("permission_id")
	permissionID, err := strconv.ParseInt(permissionIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid permission ID",
			"error":   err.Error(),
		})
		return
	}

	if err := h.service.RemovePermissionFromRole(roleID, permissionID); err != nil {
		if err == ErrNotAssigned {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Permission not assigned to role",
				"error":   err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to remove permission from role",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Permission removed from role successfully",
	})
}

// GetPermissionsByRole retrieves all permissions for a role
// GET /api/roles/:role_id/permissions
func (h *RoleHandler) GetPermissionsByRole(c *gin.Context) {
	roleIDStr := c.Param("role_id")
	roleID, err := strconv.ParseInt(roleIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid role ID",
			"error":   err.Error(),
		})
		return
	}

	permissions, err := h.service.GetPermissionsByRole(roleID)
	if err != nil {
		if err == ErrRoleNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Role not found",
				"error":   err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve permissions",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Permissions retrieved successfully",
		"data":    permissions,
	})
}

// ========== User-Role Handlers ==========

// AssignRoleToUser assigns a role to a user (admin only)
// POST /api/users/:user_id/roles/:role_id
func (h *RoleHandler) AssignRoleToUser(c *gin.Context) {
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

	roleIDStr := c.Param("role_id")
	roleID, err := strconv.ParseInt(roleIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid role ID",
			"error":   err.Error(),
		})
		return
	}

	if err := h.service.AssignRoleToUser(userID, roleID); err != nil {
		if err == ErrRoleNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Role not found",
				"error":   err.Error(),
			})
			return
		}
		if err == ErrAlreadyAssigned {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "Role already assigned to user",
				"error":   err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to assign role to user",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Role assigned to user successfully",
	})
}

// RemoveRoleFromUser removes a role from a user (admin only)
// DELETE /api/users/:user_id/roles/:role_id
func (h *RoleHandler) RemoveRoleFromUser(c *gin.Context) {
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

	roleIDStr := c.Param("role_id")
	roleID, err := strconv.ParseInt(roleIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid role ID",
			"error":   err.Error(),
		})
		return
	}

	if err := h.service.RemoveRoleFromUser(userID, roleID); err != nil {
		if err == ErrNotAssigned {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Role not assigned to user",
				"error":   err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to remove role from user",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Role removed from user successfully",
	})
}

// GetUserRoles retrieves all roles for a user
// GET /api/users/:user_id/roles
func (h *RoleHandler) GetUserRoles(c *gin.Context) {
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

	roles, err := h.service.GetRolesByUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve user roles",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User roles retrieved successfully",
		"data":    roles,
	})
}

// GetMyRoles retrieves all roles for the authenticated user
// GET /api/users/me/roles
func (h *RoleHandler) GetMyRoles(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	roles, err := h.service.GetRolesByUser(userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve user roles",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User roles retrieved successfully",
		"data":    roles,
	})
}

// GetUserPermissions retrieves all permissions for a user
// GET /api/users/:user_id/permissions
func (h *RoleHandler) GetUserPermissions(c *gin.Context) {
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

	permissions, err := h.service.GetUserPermissions(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve user permissions",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User permissions retrieved successfully",
		"data":    permissions,
	})
}

// GetMyPermissions retrieves all permissions for the authenticated user
// GET /api/users/me/permissions
func (h *RoleHandler) GetMyPermissions(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	permissions, err := h.service.GetUserPermissions(userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retrieve user permissions",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User permissions retrieved successfully",
		"data":    permissions,
	})
}
