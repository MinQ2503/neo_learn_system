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

func (r *UserRepository) BeginTx() (*sql.Tx, error) {
	return r.db.Begin()
}

// Create creates a new user
func (r *UserRepository) Create(ctx Execer, user *models.User) error {
	query := `
		INSERT INTO users (name, email, password)
		VALUES (?, ?, ?)
	`

	result, err := ctx.Exec(query, user.Name, user.Email, user.Password)

	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	user.ID = id

	return nil
}

// CreateProfile creates a profile for a user
func (r *UserRepository) CreateProfile(ctx Execer, profile *models.Profile) error {
	query := `
		INSERT INTO profiles (user_id, bio, avatar, phone, birthDay)
		VALUES (?, ?, ?, ?, ?)
	`
	_, err := ctx.Exec(
		query,
		profile.UserID,
		profile.Bio,
		profile.Avatar,
		profile.Phone,
		profile.BirthDay,
	)
	return err
}

// AssignRole assigns a role to a user
func (r *UserRepository) AssignRole(ctx Execer, userID, roleID int64) error {
	query := `
		INSERT INTO user_roles (user_id, role_id)
		VALUES (?, ?)
	`
	_, err := ctx.Exec(query, userID, roleID)
	return err
}

// FindByEmail finds a user by email
func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, name, email, email_verified_at, password, remember_token, created_at, updated_at
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

// GetProfileByUserID gets profile by user ID
func (r *UserRepository) GetProfileByUserID(userID int64) (*models.Profile, error) {
	query := `
		SELECT user_id, bio, avatar, phone, birthDay
		FROM profiles
		WHERE user_id = ?
	`

	profile := &models.Profile{}
	err := r.db.QueryRow(
		query,
		userID,
	).Scan(
		&profile.UserID,
		&profile.Bio,
		&profile.Avatar,
		&profile.Phone,
		&profile.BirthDay,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return profile, nil
}

// GetUserNameByID gets user's name by ID
func (r *UserRepository) GetNameByID(userID int64) (string, error) {
	var name string
	err := r.db.QueryRow(
		"SELECT name FROM users WHERE id = ?",
		userID,
	).Scan(&name)
	return name, err
}

// FindByID finds a user by ID
func (r *UserRepository) FindByID(id int64) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, name, email, email_verified_at, password, remember_token, created_at, updated_at
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

// GetRoleByName gets a role by name
func (r *UserRepository) GetRoleByName(name string) (*models.Role, error) {
	role := &models.Role{}
	query := `SELECT id, name, created_at, updated_at FROM roles WHERE name = ?`

	err := r.db.QueryRow(query, name).Scan(
		&role.ID,
		&role.Name,
		&role.CreatedAt,
		&role.UpdatedAt,
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

// Update avatar URL
func (r *UserRepository) UpdateAvatar(tx *sql.Tx, userID int64, avatarURL string) error {
	query := `UPDATE profiles SET avatar = ? WHERE user_id = ?`

	var execCtx Execer
	if tx != nil {
		execCtx = tx
	} else {
		execCtx = r.db
	}

	_, err := execCtx.Exec(query, avatarURL, userID)
	if err != nil {
		return fmt.Errorf("error updating avatar: %w", err)
	}
	return nil
}
