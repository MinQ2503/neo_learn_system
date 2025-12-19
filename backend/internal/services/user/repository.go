package user

import (
	"database/sql"
	"fmt"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type UserRepository struct {
	db *sql.DB
}

// DBTX interface to support both *sql.DB and *sql.Tx
type DBTX interface {
	Exec(query string, args ...interface{}) (sql.Result, error)
	Query(query string, args ...interface{}) (*sql.Rows, error)
	QueryRow(query string, args ...interface{}) *sql.Row
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) BeginTx() (*sql.Tx, error) {
	return r.db.Begin()
}

func (r *UserRepository) Create(tx *sql.Tx, user *models.User) error {
	var db DBTX = r.db
	if tx != nil {
		db = tx
	}
	query := `
		INSERT INTO users (name, email, password, created_at, updated_at)
		VALUES (?, ?, ?, NOW(), NOW())
	`
	result, err := db.Exec(query, user.Name, user.Email, user.Password)
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

func (r *UserRepository) CreateProfile(tx *sql.Tx, profile *models.Profile) error {
	var db DBTX = r.db
	if tx != nil {
		db = tx
	}
	query := `
		INSERT INTO profiles (user_id, bio, avatar, phone, birthDay, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, NOW(), NOW())
	`
	result, err := db.Exec(query, profile.UserID, profile.Bio, profile.Avatar, profile.Phone, profile.BirthDay)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	profile.ID = id
	return nil
}

func (r *UserRepository) AssignRole(tx *sql.Tx, userID int64, roleName string) error {
	var db DBTX = r.db
	if tx != nil {
		db = tx
	}
	// First get role ID
	var roleID int64
	err := db.QueryRow("SELECT id FROM roles WHERE name = ?", roleName).Scan(&roleID)
	if err != nil {
		return fmt.Errorf("role %s not found: %v", roleName, err)
	}

	query := `INSERT INTO user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW())`
	_, err = db.Exec(query, userID, roleID)
	return err
}

func (r *UserRepository) GetUsersByRole(roleName string) ([]models.User, error) {
	query := `
		SELECT u.id, u.name, u.email, u.status, u.created_at, u.updated_at,
		       p.id, p.bio, p.avatar, p.phone, p.birthday, p.created_at, p.updated_at
		FROM users u
		JOIN user_roles ur ON u.id = ur.user_id
		JOIN roles r ON ur.role_id = r.id
		LEFT JOIN profiles p ON u.id = p.user_id
		WHERE r.name = ?
	`
	rows, err := r.db.Query(query, roleName)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		var p models.Profile
		var pID sql.NullInt64
		var pBio, pAvatar, pPhone sql.NullString
		var pBirthDay sql.NullTime
		var pCreatedAt, pUpdatedAt sql.NullTime

		if err := rows.Scan(
			&u.ID, &u.Name, &u.Email, &u.CreatedAt, &u.UpdatedAt,
			&pID, &pBio, &pAvatar, &pPhone, &pBirthDay, &pCreatedAt, &pUpdatedAt,
		); err != nil {
			return nil, err
		}

		if pID.Valid {
			p.ID = pID.Int64
			p.UserID = u.ID
			p.Bio = pBio.String
			p.Avatar = pAvatar.String
			p.Phone = pPhone.String
			p.BirthDay = pBirthDay.Time
			p.CreatedAt = pCreatedAt.Time
			p.UpdatedAt = pUpdatedAt.Time
			u.Profile = &p
		}
		users = append(users, u)
	}
	return users, nil
}

func (r *UserRepository) GetByID(id int64) (*models.User, error) {
	query := `
		SELECT u.id, u.name, u.email, u.status, u.created_at, u.updated_at,
		       p.id, p.bio, p.avatar, p.phone, p.birthday, p.created_at, p.updated_at
		FROM users u
		LEFT JOIN profiles p ON u.id = p.user_id
		WHERE u.id = ?
	`
	var u models.User
	var p models.Profile
	var pID sql.NullInt64
	var pBio, pAvatar, pPhone sql.NullString
	var pBirthDay sql.NullTime
	var pCreatedAt, pUpdatedAt sql.NullTime

	err := r.db.QueryRow(query, id).Scan(
		&u.ID, &u.Name, &u.Email, &u.CreatedAt, &u.UpdatedAt,
		&pID, &pBio, &pAvatar, &pPhone, &pBirthDay, &pCreatedAt, &pUpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	if pID.Valid {
		p.ID = pID.Int64
		p.UserID = u.ID
		p.Bio = pBio.String
		p.Avatar = pAvatar.String
		p.Phone = pPhone.String
		p.BirthDay = pBirthDay.Time
		p.CreatedAt = pCreatedAt.Time
		p.UpdatedAt = pUpdatedAt.Time
		u.Profile = &p
	}

	return &u, nil
}

func (r *UserRepository) Update(user *models.User) error {
	query := `UPDATE users SET name = ?, email = ?, updated_at = NOW() WHERE id = ?`
	_, err := r.db.Exec(query, user.Name, user.Email, user.ID)
	return err
}

func (r *UserRepository) UpdateProfile(profile *models.Profile) error {
	// Check if profile exists
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM profiles WHERE user_id = ?", profile.UserID).Scan(&count)
	if err != nil {
		return err
	}

	if count == 0 {
		// Create if not exists
		query := `
			INSERT INTO profiles (user_id, bio, avatar, phone, birthday, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, NOW(), NOW())
		`
		_, err := r.db.Exec(query, profile.UserID, profile.Bio, profile.Avatar, profile.Phone, profile.BirthDay)
		return err
	}

	query := `
		UPDATE profiles 
		SET bio = ?, avatar = ?, phone = ?, birthday = ?, updated_at = NOW() 
		WHERE user_id = ?
	`
	_, err = r.db.Exec(query, profile.Bio, profile.Avatar, profile.Phone, profile.BirthDay, profile.UserID)
	return err
}

func (r *UserRepository) Delete(id int64) error {
	// Transaction might be better here to delete from user_roles too, but for now simple delete
	// Assuming ON DELETE CASCADE is set in DB, otherwise we need to delete relations first
	query := `DELETE FROM users WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *UserRepository) EmailExists(email string) (bool, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM users WHERE email = ?", email).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *UserRepository) HasRole(userID int64, roleName string) (bool, error) {
	query := `
		SELECT COUNT(*)
		FROM user_roles ur
		JOIN roles r ON ur.role_id = r.id
		WHERE ur.user_id = ? AND r.name = ?
	`
	var count int
	err := r.db.QueryRow(query, userID, roleName).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
