package profile

import (
	"database/sql"
	"time"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type ProfileRepository struct {
	db *sql.DB
}

func NewProfileRepository(db *sql.DB) *ProfileRepository {
	return &ProfileRepository{db: db}
}

// GetByUserID retrieves a profile by user ID
func (r *ProfileRepository) GetByUserID(userID int64) (*models.Profile, error) {
	profile := &models.Profile{}
	query := `SELECT id, user_id, bio, avatar, phone, birthDay, created_at, updated_at 
			  FROM profiles WHERE user_id = ?`

	err := r.db.QueryRow(query, userID).Scan(
		&profile.ID,
		&profile.UserID,
		&profile.Bio,
		&profile.Avatar,
		&profile.Phone,
		&profile.BirthDay,
		&profile.CreatedAt,
		&profile.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return profile, nil
}

// Create creates a new profile
func (r *ProfileRepository) Create(profile *models.Profile) error {
	query := `INSERT INTO profiles (user_id, bio, avatar, phone, birthDay, created_at, updated_at) 
			  VALUES (?, ?, ?, ?, ?, ?, ?)`

	now := time.Now()
	result, err := r.db.Exec(query,
		profile.UserID,
		profile.Bio,
		profile.Avatar,
		profile.Phone,
		profile.BirthDay,
		now,
		now,
	)

	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	profile.ID = id
	profile.CreatedAt = now
	profile.UpdatedAt = now

	return nil
}

// Update updates an existing profile
func (r *ProfileRepository) Update(profile *models.Profile) error {
	query := `UPDATE profiles SET bio = ?, avatar = ?, phone = ?, birthDay = ?, updated_at = ? 
			  WHERE user_id = ?`

	now := time.Now()
	_, err := r.db.Exec(query,
		profile.Bio,
		profile.Avatar,
		profile.Phone,
		profile.BirthDay,
		now,
		profile.UserID,
	)

	if err != nil {
		return err
	}

	profile.UpdatedAt = now
	return nil
}

// Delete deletes a profile by user ID
func (r *ProfileRepository) Delete(userID int64) error {
	query := `DELETE FROM profiles WHERE user_id = ?`
	_, err := r.db.Exec(query, userID)
	return err
}
