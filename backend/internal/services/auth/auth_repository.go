package auth

import (
	"database/sql"
	"fmt"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create creates a new user
func (r *UserRepository) Create(user *models.User) error {
	query := `
		INSERT INTO users (name, email, password, status)
		VALUES (?, ?, ?, ?)
	`

	result, err := r.db.Exec(
		query,
		user.Name,
		user.Email,
		user.Password,
		1, // status = 1 (active)
	)

	if err != nil {
		return fmt.Errorf("error creating user: %w", err)
	}

	userID, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("error getting last insert id: %w", err)
	}
	user.ID = userID

	// Create default profile
	profileQuery := `
		INSERT INTO profiles (user_id, bio, avatar, phone)
		VALUES (?, '', '', '')
	`
	_, err = r.db.Exec(profileQuery, user.ID)
	if err != nil {
		return fmt.Errorf("error creating user profile: %w", err)
	}

	return nil
}

// FindByEmail finds a user by email
func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, name, email, email_verified_at, password, remember_token, status, created_at, updated_at
		FROM users
		WHERE email = ?
	`

	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.EmailVerifiedAt,
		&user.Password,
		&user.RememberToken,
		&user.Status,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("error finding user by email: %w", err)
	}

	return user, nil
}

// FindByID finds a user by ID
func (r *UserRepository) FindByID(id int64) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, name, email, email_verified_at, password, remember_token, status, created_at, updated_at
		FROM users
		WHERE id = ?
	`

	err := r.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.EmailVerifiedAt,
		&user.Password,
		&user.RememberToken,
		&user.Status,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("error finding user by id: %w", err)
	}

	return user, nil
}

// GetUserRoles gets all roles for a user
func (r *UserRepository) GetUserRoles(userID int64) ([]string, error) {
	query := `
		SELECT r.name
		FROM roles r
		INNER JOIN user_roles ur ON r.id = ur.role_id
		WHERE ur.user_id = ?
	`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("error getting user roles: %w", err)
	}
	defer rows.Close()

	var roles []string
	for rows.Next() {
		var roleName string
		if err := rows.Scan(&roleName); err != nil {
			return nil, fmt.Errorf("error scanning role: %w", err)
		}
		roles = append(roles, roleName)
	}

	return roles, nil
}

// AssignRole assigns a role to a user
func (r *UserRepository) AssignRole(userID, roleID int64) error {
	query := `
		INSERT IGNORE INTO user_roles (user_id, role_id)
		VALUES (?, ?)
	`

	_, err := r.db.Exec(query, userID, roleID)
	if err != nil {
		return fmt.Errorf("error assigning role: %w", err)
	}

	return nil
}

// GetRoleByName gets a role by name
func (r *UserRepository) GetRoleByName(name string) (*models.Role, error) {
	role := &models.Role{}
	query := `SELECT id, name, description, created_at FROM roles WHERE name = ?`

	err := r.db.QueryRow(query, name).Scan(
		&role.ID,
		&role.Name,
		&role.Description,
		&role.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("error getting role by name: %w", err)
	}

	return role, nil
}

// UpdatePassword updates user password
func (r *UserRepository) UpdatePassword(userID int64, hashedPassword string) error {
	query := `
		UPDATE users 
		SET password = ?
		WHERE id = ?
	`

	_, err := r.db.Exec(query, hashedPassword, userID)
	if err != nil {
		return fmt.Errorf("error updating password: %w", err)
	}

	return nil
}

// Update updates user information
func (r *UserRepository) Update(user *models.User) error {
	query := `
		UPDATE users 
		SET name = ?, email = ?
		WHERE id = ?
	`

	_, err := r.db.Exec(query, user.Name, user.Email, user.ID)
	if err != nil {
		return fmt.Errorf("error updating user: %w", err)
	}

	return nil
}
