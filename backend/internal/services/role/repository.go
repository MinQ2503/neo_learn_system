package role

import (
	"database/sql"
	"time"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type RoleRepository struct {
	db *sql.DB
}

func NewRoleRepository(db *sql.DB) *RoleRepository {
	return &RoleRepository{db: db}
}

// ========== Role Operations ==========

// CreateRole creates a new role
func (r *RoleRepository) CreateRole(role *models.Role) error {
	query := `INSERT INTO roles (name, created_at, updated_at) VALUES (?, ?, ?)`

	now := time.Now()
	result, err := r.db.Exec(query, role.Name, now, now)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	role.ID = id
	role.CreatedAt = now
	role.UpdatedAt = now
	return nil
}

// GetRoleByID retrieves a role by ID
func (r *RoleRepository) GetRoleByID(id int64) (*models.Role, error) {
	role := &models.Role{}
	query := `SELECT id, name, created_at, updated_at FROM roles WHERE id = ?`

	err := r.db.QueryRow(query, id).Scan(&role.ID, &role.Name, &role.CreatedAt, &role.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return role, nil
}

// GetRoleByName retrieves a role by name
func (r *RoleRepository) GetRoleByName(name string) (*models.Role, error) {
	role := &models.Role{}
	query := `SELECT id, name, created_at, updated_at FROM roles WHERE name = ?`

	err := r.db.QueryRow(query, name).Scan(&role.ID, &role.Name, &role.CreatedAt, &role.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return role, nil
}

// GetAllRoles retrieves all roles
func (r *RoleRepository) GetAllRoles() ([]*models.Role, error) {
	query := `SELECT id, name, created_at, updated_at FROM roles`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []*models.Role
	for rows.Next() {
		role := &models.Role{}
		err := rows.Scan(&role.ID, &role.Name, &role.CreatedAt, &role.UpdatedAt)
		if err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}

	return roles, nil
}

// ========== Permission Operations ==========

// CreatePermission creates a new permission
func (r *RoleRepository) CreatePermission(permission *models.Permission) error {
	query := `INSERT INTO permissions (name, created_at, updated_at) VALUES (?, ?, ?)`

	now := time.Now()
	result, err := r.db.Exec(query, permission.Name, now, now)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	permission.ID = id
	permission.CreatedAt = now
	permission.UpdatedAt = now
	return nil
}

// GetPermissionByID retrieves a permission by ID
func (r *RoleRepository) GetPermissionByID(id int64) (*models.Permission, error) {
	permission := &models.Permission{}
	query := `SELECT id, name, created_at, updated_at FROM permissions WHERE id = ?`

	err := r.db.QueryRow(query, id).Scan(&permission.ID, &permission.Name, &permission.CreatedAt, &permission.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return permission, nil
}

// GetAllPermissions retrieves all permissions
func (r *RoleRepository) GetAllPermissions() ([]*models.Permission, error) {
	query := `SELECT id, name, created_at, updated_at FROM permissions`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var permissions []*models.Permission
	for rows.Next() {
		permission := &models.Permission{}
		err := rows.Scan(&permission.ID, &permission.Name, &permission.CreatedAt, &permission.UpdatedAt)
		if err != nil {
			return nil, err
		}
		permissions = append(permissions, permission)
	}

	return permissions, nil
}

// ========== Role-Permission Operations ==========

// AssignPermissionToRole assigns a permission to a role
func (r *RoleRepository) AssignPermissionToRole(roleID, permissionID int64) error {
	query := `INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES (?, ?, ?, ?)`

	now := time.Now()
	_, err := r.db.Exec(query, roleID, permissionID, now, now)
	return err
}

// RemovePermissionFromRole removes a permission from a role
func (r *RoleRepository) RemovePermissionFromRole(roleID, permissionID int64) error {
	query := `DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?`
	_, err := r.db.Exec(query, roleID, permissionID)
	return err
}

// GetPermissionsByRole retrieves all permissions for a role
func (r *RoleRepository) GetPermissionsByRole(roleID int64) ([]*models.Permission, error) {
	query := `SELECT p.id, p.name, p.created_at, p.updated_at 
			  FROM permissions p
			  INNER JOIN role_permissions rp ON p.id = rp.permission_id
			  WHERE rp.role_id = ?`

	rows, err := r.db.Query(query, roleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var permissions []*models.Permission
	for rows.Next() {
		permission := &models.Permission{}
		err := rows.Scan(&permission.ID, &permission.Name, &permission.CreatedAt, &permission.UpdatedAt)
		if err != nil {
			return nil, err
		}
		permissions = append(permissions, permission)
	}

	return permissions, nil
}

// HasPermission checks if a role has a specific permission
func (r *RoleRepository) HasPermission(roleID, permissionID int64) (bool, error) {
	query := `SELECT COUNT(*) FROM role_permissions WHERE role_id = ? AND permission_id = ?`

	var count int
	err := r.db.QueryRow(query, roleID, permissionID).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// ========== User-Role Operations ==========

// AssignRoleToUser assigns a role to a user
func (r *RoleRepository) AssignRoleToUser(userID, roleID int64) error {
	query := `INSERT INTO user_roles (user_id, role_id, created_at, updated_at) VALUES (?, ?, ?, ?)`

	now := time.Now()
	_, err := r.db.Exec(query, userID, roleID, now, now)
	return err
}

// RemoveRoleFromUser removes a role from a user
func (r *RoleRepository) RemoveRoleFromUser(userID, roleID int64) error {
	query := `DELETE FROM user_roles WHERE user_id = ? AND role_id = ?`
	_, err := r.db.Exec(query, userID, roleID)
	return err
}

// GetRolesByUser retrieves all roles for a user
func (r *RoleRepository) GetRolesByUser(userID int64) ([]*models.Role, error) {
	query := `SELECT r.id, r.name, r.created_at, r.updated_at 
			  FROM roles r
			  INNER JOIN user_roles ur ON r.id = ur.role_id
			  WHERE ur.user_id = ?`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []*models.Role
	for rows.Next() {
		role := &models.Role{}
		err := rows.Scan(&role.ID, &role.Name, &role.CreatedAt, &role.UpdatedAt)
		if err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}

	return roles, nil
}

// HasRole checks if a user has a specific role
func (r *RoleRepository) HasRole(userID, roleID int64) (bool, error) {
	query := `SELECT COUNT(*) FROM user_roles WHERE user_id = ? AND role_id = ?`

	var count int
	err := r.db.QueryRow(query, userID, roleID).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// GetUserPermissions retrieves all permissions for a user (through their roles)
func (r *RoleRepository) GetUserPermissions(userID int64) ([]*models.Permission, error) {
	query := `SELECT DISTINCT p.id, p.name, p.created_at, p.updated_at 
			  FROM permissions p
			  INNER JOIN role_permissions rp ON p.id = rp.permission_id
			  INNER JOIN user_roles ur ON rp.role_id = ur.role_id
			  WHERE ur.user_id = ?`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var permissions []*models.Permission
	for rows.Next() {
		permission := &models.Permission{}
		err := rows.Scan(&permission.ID, &permission.Name, &permission.CreatedAt, &permission.UpdatedAt)
		if err != nil {
			return nil, err
		}
		permissions = append(permissions, permission)
	}

	return permissions, nil
}

// UserHasPermission checks if a user has a specific permission (through any of their roles)
func (r *RoleRepository) UserHasPermission(userID int64, permissionName string) (bool, error) {
	query := `SELECT COUNT(*) 
			  FROM permissions p
			  INNER JOIN role_permissions rp ON p.id = rp.permission_id
			  INNER JOIN user_roles ur ON rp.role_id = ur.role_id
			  WHERE ur.user_id = ? AND p.name = ?`

	var count int
	err := r.db.QueryRow(query, userID, permissionName).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}
