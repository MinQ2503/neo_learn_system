package role

import (
	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type RoleService struct {
	repo *RoleRepository
}

func NewRoleService(repo *RoleRepository) *RoleService {
	return &RoleService{repo: repo}
}

// ========== Role Operations ==========

// CreateRole creates a new role
func (s *RoleService) CreateRole(role *models.Role) error {
	if role.Name == "" {
		return ErrInvalidData
	}

	// Check if role already exists
	existing, err := s.repo.GetRoleByName(role.Name)
	if err != nil {
		return err
	}
	if existing != nil {
		return ErrRoleExists
	}

	return s.repo.CreateRole(role)
}

// GetRole retrieves a role by ID
func (s *RoleService) GetRole(id int64) (*models.Role, error) {
	return s.repo.GetRoleByID(id)
}

// GetAllRoles retrieves all roles
func (s *RoleService) GetAllRoles() ([]*models.Role, error) {
	return s.repo.GetAllRoles()
}

// ========== Permission Operations ==========

// CreatePermission creates a new permission
func (s *RoleService) CreatePermission(permission *models.Permission) error {
	if permission.Name == "" {
		return ErrInvalidData
	}

	return s.repo.CreatePermission(permission)
}

// GetPermission retrieves a permission by ID
func (s *RoleService) GetPermission(id int64) (*models.Permission, error) {
	return s.repo.GetPermissionByID(id)
}

// GetAllPermissions retrieves all permissions
func (s *RoleService) GetAllPermissions() ([]*models.Permission, error) {
	return s.repo.GetAllPermissions()
}

// ========== Role-Permission Operations ==========

// AssignPermissionToRole assigns a permission to a role
func (s *RoleService) AssignPermissionToRole(roleID, permissionID int64) error {
	// Check if role exists
	role, err := s.repo.GetRoleByID(roleID)
	if err != nil {
		return err
	}
	if role == nil {
		return ErrRoleNotFound
	}

	// Check if permission exists
	permission, err := s.repo.GetPermissionByID(permissionID)
	if err != nil {
		return err
	}
	if permission == nil {
		return ErrPermissionNotFound
	}

	// Check if already assigned
	hasPermission, err := s.repo.HasPermission(roleID, permissionID)
	if err != nil {
		return err
	}
	if hasPermission {
		return ErrAlreadyAssigned
	}

	return s.repo.AssignPermissionToRole(roleID, permissionID)
}

// RemovePermissionFromRole removes a permission from a role
func (s *RoleService) RemovePermissionFromRole(roleID, permissionID int64) error {
	// Check if role exists
	role, err := s.repo.GetRoleByID(roleID)
	if err != nil {
		return err
	}
	if role == nil {
		return ErrRoleNotFound
	}

	// Check if permission exists
	permission, err := s.repo.GetPermissionByID(permissionID)
	if err != nil {
		return err
	}
	if permission == nil {
		return ErrPermissionNotFound
	}

	// Check if assigned
	hasPermission, err := s.repo.HasPermission(roleID, permissionID)
	if err != nil {
		return err
	}
	if !hasPermission {
		return ErrNotAssigned
	}

	return s.repo.RemovePermissionFromRole(roleID, permissionID)
}

// GetPermissionsByRole retrieves all permissions for a role
func (s *RoleService) GetPermissionsByRole(roleID int64) ([]*models.Permission, error) {
	// Check if role exists
	role, err := s.repo.GetRoleByID(roleID)
	if err != nil {
		return nil, err
	}
	if role == nil {
		return nil, ErrRoleNotFound
	}

	return s.repo.GetPermissionsByRole(roleID)
}

// ========== User-Role Operations ==========

// AssignRoleToUser assigns a role to a user
func (s *RoleService) AssignRoleToUser(userID, roleID int64) error {
	// Check if role exists
	role, err := s.repo.GetRoleByID(roleID)
	if err != nil {
		return err
	}
	if role == nil {
		return ErrRoleNotFound
	}

	// Check if already assigned
	hasRole, err := s.repo.HasRole(userID, roleID)
	if err != nil {
		return err
	}
	if hasRole {
		return ErrAlreadyAssigned
	}

	return s.repo.AssignRoleToUser(userID, roleID)
}

// RemoveRoleFromUser removes a role from a user
func (s *RoleService) RemoveRoleFromUser(userID, roleID int64) error {
	// Check if role exists
	role, err := s.repo.GetRoleByID(roleID)
	if err != nil {
		return err
	}
	if role == nil {
		return ErrRoleNotFound
	}

	// Check if assigned
	hasRole, err := s.repo.HasRole(userID, roleID)
	if err != nil {
		return err
	}
	if !hasRole {
		return ErrNotAssigned
	}

	return s.repo.RemoveRoleFromUser(userID, roleID)
}

// GetRolesByUser retrieves all roles for a user
func (s *RoleService) GetRolesByUser(userID int64) ([]*models.Role, error) {
	return s.repo.GetRolesByUser(userID)
}

// GetUserPermissions retrieves all permissions for a user (through their roles)
func (s *RoleService) GetUserPermissions(userID int64) ([]*models.Permission, error) {
	return s.repo.GetUserPermissions(userID)
}

// UserHasPermission checks if a user has a specific permission
func (s *RoleService) UserHasPermission(userID int64, permissionName string) (bool, error) {
	return s.repo.UserHasPermission(userID, permissionName)
}

// UserHasRole checks if a user has a specific role
func (s *RoleService) UserHasRole(userID int64, roleName string) (bool, error) {
	// Get role by name
	role, err := s.repo.GetRoleByName(roleName)
	if err != nil {
		return false, err
	}
	if role == nil {
		return false, nil
	}

	return s.repo.HasRole(userID, role.ID)
}
