package violation

import (
	"database/sql"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type ViolationRepository struct {
	db *sql.DB
}

// DBTX interface to support both *sql.DB and *sql.Tx
type DBTX interface {
	Exec(query string, args ...interface{}) (sql.Result, error)
	Query(query string, args ...interface{}) (*sql.Rows, error)
	QueryRow(query string, args ...interface{}) *sql.Row
}

func NewViolationRepository(db *sql.DB) *ViolationRepository {
	return &ViolationRepository{db: db}
}

// Create creates a new violation record
func (r *ViolationRepository) Create(violation *models.QuizAttemptViolation) error {
	query := `
		INSERT INTO quiz_attempt_violations (user_quiz_attempt_id, type, level, detected_at, evidence_url)
		VALUES (?, ?, ?, ?, ?)
	`
	result, err := r.db.Exec(
		query,
		violation.UserQuizAttemptID,
		violation.Type,
		violation.Level,
		violation.DetectedAt,
		violation.EvidenceURL,
	)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	violation.ID = id
	return nil
}

// GetByAttemptID retrieves all violations for a specific quiz attempt
func (r *ViolationRepository) GetByAttemptID(attemptID int64) ([]models.QuizAttemptViolation, error) {
	query := `
		SELECT id, user_quiz_attempt_id, type, level, detected_at, evidence_url
		FROM quiz_attempt_violations
		WHERE user_quiz_attempt_id = ?
		ORDER BY detected_at DESC
	`
	rows, err := r.db.Query(query, attemptID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var violations []models.QuizAttemptViolation
	for rows.Next() {
		var v models.QuizAttemptViolation
		var evidenceURL sql.NullString

		err := rows.Scan(
			&v.ID,
			&v.UserQuizAttemptID,
			&v.Type,
			&v.Level,
			&v.DetectedAt,
			&evidenceURL,
		)
		if err != nil {
			return nil, err
		}

		if evidenceURL.Valid {
			v.EvidenceURL = &evidenceURL.String
		}

		violations = append(violations, v)
	}

	return violations, nil
}

// GetByID retrieves a violation by its ID
func (r *ViolationRepository) GetByID(id int64) (*models.QuizAttemptViolation, error) {
	query := `
		SELECT id, user_quiz_attempt_id, type, level, detected_at, evidence_url
		FROM quiz_attempt_violations
		WHERE id = ?
	`
	var v models.QuizAttemptViolation
	var evidenceURL sql.NullString

	err := r.db.QueryRow(query, id).Scan(
		&v.ID,
		&v.UserQuizAttemptID,
		&v.Type,
		&v.Level,
		&v.DetectedAt,
		&evidenceURL,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	if evidenceURL.Valid {
		v.EvidenceURL = &evidenceURL.String
	}

	return &v, nil
}

// CountByAttemptID counts violations for a specific attempt
func (r *ViolationRepository) CountByAttemptID(attemptID int64) (int, error) {
	query := `SELECT COUNT(*) FROM quiz_attempt_violations WHERE user_quiz_attempt_id = ?`
	var count int
	err := r.db.QueryRow(query, attemptID).Scan(&count)
	return count, err
}

// CreateBatch creates multiple violations in a single transaction
func (r *ViolationRepository) CreateBatch(violations []models.QuizAttemptViolation) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
		INSERT INTO quiz_attempt_violations (user_quiz_attempt_id, type, level, detected_at, evidence_url)
		VALUES (?, ?, ?, ?, ?)
	`

	stmt, err := tx.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, v := range violations {
		_, err := stmt.Exec(
			v.UserQuizAttemptID,
			v.Type,
			v.Level,
			v.DetectedAt,
			v.EvidenceURL,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}
