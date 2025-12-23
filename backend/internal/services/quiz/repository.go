package quiz

import (
	"database/sql"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

// CheckUserHasProfileImage checks if user has uploaded profile image
func (r *Repository) CheckUserHasProfileImage(userID int64) (bool, error) {
	var avatar sql.NullString
	query := `SELECT avatar FROM profiles WHERE user_id = ?`

	err := r.db.QueryRow(query, userID).Scan(&avatar)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}

	// Check if avatar is not null and not empty
	return avatar.Valid && avatar.String != "", nil
}

// GetQuizByID retrieves a quiz by its ID
func (r *Repository) GetQuizByID(quizID int64) (*models.Quiz, error) {
	var quiz models.Quiz
	query := `
		SELECT id, course_id, user_id, name, description, start_time, end_time, 
		       minute, enable_face_recognition, enable_anti_cheat, max_violations,
		       allow_headphone, max_attempts, shuffle_questions, allow_review,
		       created_at, updated_at
		FROM quizzes 
		WHERE id = ?
	`

	err := r.db.QueryRow(query, quizID).Scan(
		&quiz.ID, &quiz.CourseID, &quiz.UserID, &quiz.Name, &quiz.Description,
		&quiz.StartTime, &quiz.EndTime, &quiz.Minute, &quiz.EnableFaceRecognition,
		&quiz.EnableAntiCheat, &quiz.MaxViolations, &quiz.AllowHeadphone,
		&quiz.MaxAttempts, &quiz.ShuffleQuestions, &quiz.AllowReview,
		&quiz.CreatedAt, &quiz.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &quiz, nil
}

// CreateQuizAttempt creates a new quiz attempt
func (r *Repository) CreateQuizAttempt(attempt *models.UserQuizAttempt) error {
	query := `
		INSERT INTO user_quiz_attempts (quiz_id, user_id, created_at, updated_at)
		VALUES (?, ?, NOW(), NOW())
	`

	result, err := r.db.Exec(query, attempt.QuizID, attempt.UserID)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	attempt.ID = id
	return nil
}

// GetQuizAttemptByID retrieves a quiz attempt by its ID
func (r *Repository) GetQuizAttemptByID(attemptID int64) (*models.UserQuizAttempt, error) {
	var attempt models.UserQuizAttempt
	query := `
		SELECT id, quiz_id, user_id, score, created_at, updated_at
		FROM user_quiz_attempts
		WHERE id = ?
	`

	err := r.db.QueryRow(query, attemptID).Scan(
		&attempt.ID, &attempt.QuizID, &attempt.UserID,
		&attempt.Score, &attempt.CreatedAt, &attempt.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &attempt, nil
}

// CountUserQuizAttempts counts how many times a user has attempted a quiz
func (r *Repository) CountUserQuizAttempts(quizID, userID int64) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM user_quiz_attempts WHERE quiz_id = ? AND user_id = ?`

	err := r.db.QueryRow(query, quizID, userID).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

// CreateViolation creates a new violation record
func (r *Repository) CreateViolation(violation *models.QuizAttemptViolation) error {
	query := `
		INSERT INTO quiz_attempt_violations 
		(user_quiz_attempt_id, type, level, detected_at, evidence_url)
		VALUES (?, ?, ?, NOW(), ?)
	`

	result, err := r.db.Exec(query,
		violation.UserQuizAttemptID,
		violation.Type,
		violation.Level,
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

// GetViolationCount gets the total violation count for an attempt
func (r *Repository) GetViolationCount(attemptID int64) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM quiz_attempt_violations WHERE user_quiz_attempt_id = ?`

	err := r.db.QueryRow(query, attemptID).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

// CheckUserEnrolledInCourse checks if user is enrolled in the course
func (r *Repository) CheckUserEnrolledInCourse(userID, courseID int64) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM course_enrollments WHERE user_id = ? AND course_id = ?)`

	err := r.db.QueryRow(query, userID, courseID).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}
