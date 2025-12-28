package assignment

import (
	"database/sql"
	"time"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type AssignmentRepository struct {
	db *sql.DB
}

func NewAssignmentRepository(db *sql.DB) *AssignmentRepository {
	return &AssignmentRepository{db: db}
}

// Create creates a new assignment
func (r *AssignmentRepository) Create(assignment *models.Assignment) error {
	query := `INSERT INTO assignments (course_id, user_id, name, description, start_time, due_time, created_at, updated_at) 
			  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

	now := time.Now()
	result, err := r.db.Exec(query,
		assignment.CourseID,
		assignment.UserID,
		assignment.Name,
		assignment.Description,
		assignment.StartTime,
		assignment.DueTime,
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

	assignment.ID = id
	assignment.CreatedAt = now
	assignment.UpdatedAt = now
	return nil
}

// GetByID retrieves an assignment by ID
func (r *AssignmentRepository) GetByID(id int64) (*models.Assignment, error) {
	assignment := &models.Assignment{}
	query := `SELECT id, course_id, user_id, name, description, start_time, due_time, created_at, updated_at 
			  FROM assignments WHERE id = ?`

	err := r.db.QueryRow(query, id).Scan(
		&assignment.ID,
		&assignment.CourseID,
		&assignment.UserID,
		&assignment.Name,
		&assignment.Description,
		&assignment.StartTime,
		&assignment.DueTime,
		&assignment.CreatedAt,
		&assignment.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return assignment, nil
}

// GetByCourseID retrieves all assignments for a course
func (r *AssignmentRepository) GetByCourseID(courseID int64) ([]*models.Assignment, error) {
	query := `SELECT id, course_id, user_id, name, description, start_time, due_time, created_at, updated_at 
			  FROM assignments WHERE course_id = ? ORDER BY start_time DESC`

	rows, err := r.db.Query(query, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assignments []*models.Assignment
	for rows.Next() {
		assignment := &models.Assignment{}
		err := rows.Scan(
			&assignment.ID,
			&assignment.CourseID,
			&assignment.UserID,
			&assignment.Name,
			&assignment.Description,
			&assignment.StartTime,
			&assignment.DueTime,
			&assignment.CreatedAt,
			&assignment.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		assignments = append(assignments, assignment)
	}

	return assignments, nil
}

// Update updates an assignment
func (r *AssignmentRepository) Update(assignment *models.Assignment) error {
	query := `UPDATE assignments 
			  SET name = ?, description = ?, start_time = ?, due_time = ?, updated_at = ? 
			  WHERE id = ?`

	now := time.Now()
	_, err := r.db.Exec(query,
		assignment.Name,
		assignment.Description,
		assignment.StartTime,
		assignment.DueTime,
		now,
		assignment.ID,
	)

	if err != nil {
		return err
	}

	assignment.UpdatedAt = now
	return nil
}

// Delete deletes an assignment
func (r *AssignmentRepository) Delete(id int64) error {
	query := `DELETE FROM assignments WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

// CreateSubmission creates a new assignment submission
func (r *AssignmentRepository) CreateSubmission(submission *models.AssignmentSubmission) error {
	query := `INSERT INTO assignment_submissions 
			  (assignment_id, user_id, file_path, status, created_at, updated_at) 
			  VALUES (?, ?, ?, ?, ?, ?)`

	now := time.Now()
	result, err := r.db.Exec(query,
		submission.AssignmentID,
		submission.UserID,
		submission.FilePath,
		submission.Status,
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

	submission.ID = id
	submission.CreatedAt = now
	submission.UpdatedAt = now
	return nil
}

// GetSubmissionByID retrieves a submission by ID
func (r *AssignmentRepository) GetSubmissionByID(id int64) (*models.AssignmentSubmission, error) {
	submission := &models.AssignmentSubmission{}
	query := `SELECT id, assignment_id, user_id, file_path, score, feedback, status, graded_by, created_at, updated_at 
			  FROM assignment_submissions WHERE id = ?`

	err := r.db.QueryRow(query, id).Scan(
		&submission.ID,
		&submission.AssignmentID,
		&submission.UserID,
		&submission.FilePath,
		&submission.Score,
		&submission.Feedback,
		&submission.Status,
		&submission.GradedBy,
		&submission.CreatedAt,
		&submission.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return submission, nil
}

// GetSubmissionByAssignmentAndUser retrieves a submission by assignment and user
func (r *AssignmentRepository) GetSubmissionByAssignmentAndUser(assignmentID, userID int64) (*models.AssignmentSubmission, error) {
	submission := &models.AssignmentSubmission{}
	query := `SELECT id, assignment_id, user_id, file_path, score, feedback, status, graded_by, created_at, updated_at 
			  FROM assignment_submissions WHERE assignment_id = ? AND user_id = ?`

	err := r.db.QueryRow(query, assignmentID, userID).Scan(
		&submission.ID,
		&submission.AssignmentID,
		&submission.UserID,
		&submission.FilePath,
		&submission.Score,
		&submission.Feedback,
		&submission.Status,
		&submission.GradedBy,
		&submission.CreatedAt,
		&submission.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return submission, nil
}

// GetSubmissionsByAssignment retrieves all submissions for an assignment
func (r *AssignmentRepository) GetSubmissionsByAssignment(assignmentID int64) ([]*models.AssignmentSubmission, error) {
	query := `SELECT id, assignment_id, user_id, file_path, score, feedback, status, graded_by, created_at, updated_at 
			  FROM assignment_submissions WHERE assignment_id = ? ORDER BY created_at DESC`

	rows, err := r.db.Query(query, assignmentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var submissions []*models.AssignmentSubmission
	for rows.Next() {
		submission := &models.AssignmentSubmission{}
		err := rows.Scan(
			&submission.ID,
			&submission.AssignmentID,
			&submission.UserID,
			&submission.FilePath,
			&submission.Score,
			&submission.Feedback,
			&submission.Status,
			&submission.GradedBy,
			&submission.CreatedAt,
			&submission.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		submissions = append(submissions, submission)
	}

	return submissions, nil
}

// UpdateSubmission updates a submission (for resubmission)
func (r *AssignmentRepository) UpdateSubmission(submission *models.AssignmentSubmission) error {
	query := `UPDATE assignment_submissions 
			  SET file_path = ?, updated_at = ? 
			  WHERE id = ?`

	now := time.Now()
	_, err := r.db.Exec(query, submission.FilePath, now, submission.ID)
	if err != nil {
		return err
	}

	submission.UpdatedAt = now
	return nil
}

// GradeSubmission grades a submission
func (r *AssignmentRepository) GradeSubmission(submissionID int64, score int, feedback string, gradedBy int64) error {
	query := `UPDATE assignment_submissions 
			  SET score = ?, feedback = ?, status = 1, graded_by = ?, updated_at = ? 
			  WHERE id = ?`

	now := time.Now()
	_, err := r.db.Exec(query, score, feedback, gradedBy, now, submissionID)
	return err
}

// GetSubmissionsByCourseAndUser retrieves all submissions by a user in a course
func (r *AssignmentRepository) GetSubmissionsByCourseAndUser(courseID, userID int64) ([]*models.AssignmentSubmission, error) {
	query := `SELECT s.id, s.assignment_id, s.user_id, s.file_path, s.score, s.feedback, s.status, s.graded_by, s.created_at, s.updated_at 
			  FROM assignment_submissions s
			  INNER JOIN assignments a ON s.assignment_id = a.id
			  WHERE a.course_id = ? AND s.user_id = ?
			  ORDER BY s.created_at DESC`

	rows, err := r.db.Query(query, courseID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var submissions []*models.AssignmentSubmission
	for rows.Next() {
		submission := &models.AssignmentSubmission{}
		err := rows.Scan(
			&submission.ID,
			&submission.AssignmentID,
			&submission.UserID,
			&submission.FilePath,
			&submission.Score,
			&submission.Feedback,
			&submission.Status,
			&submission.GradedBy,
			&submission.CreatedAt,
			&submission.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		submissions = append(submissions, submission)
	}

	return submissions, nil
}
