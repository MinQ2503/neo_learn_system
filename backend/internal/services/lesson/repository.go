package lesson

import (
	"database/sql"
	"time"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type LessonRepository struct {
	db *sql.DB
}

func NewLessonRepository(db *sql.DB) *LessonRepository {
	return &LessonRepository{db: db}
}

// Create creates a new lesson
func (r *LessonRepository) Create(lesson *models.Lesson) error {
	query := `INSERT INTO lessons (name, description, file_url, content, course_id, user_id, created_at, updated_at) 
			  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

	now := time.Now()
	result, err := r.db.Exec(query,
		lesson.Name,
		lesson.Description,
		lesson.FileURL,
		lesson.Content,
		lesson.CourseID,
		lesson.UserID,
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

	lesson.ID = id
	lesson.CreatedAt = now
	lesson.UpdatedAt = now
	return nil
}

// GetByID retrieves a lesson by ID
func (r *LessonRepository) GetByID(id int64) (*models.Lesson, error) {
	lesson := &models.Lesson{}
	query := `SELECT id, name, description, file_url, content, course_id, user_id, created_at, updated_at 
			  FROM lessons WHERE id = ?`

	err := r.db.QueryRow(query, id).Scan(
		&lesson.ID,
		&lesson.Name,
		&lesson.Description,
		&lesson.FileURL,
		&lesson.Content,
		&lesson.CourseID,
		&lesson.UserID,
		&lesson.CreatedAt,
		&lesson.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return lesson, nil
}

// GetByCourseID retrieves all lessons for a course
func (r *LessonRepository) GetByCourseID(courseID int64) ([]*models.Lesson, error) {
	query := `SELECT id, name, description, file_url, content, course_id, user_id, created_at, updated_at 
			  FROM lessons WHERE course_id = ? ORDER BY created_at ASC`

	rows, err := r.db.Query(query, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lessons []*models.Lesson
	for rows.Next() {
		lesson := &models.Lesson{}
		err := rows.Scan(
			&lesson.ID,
			&lesson.Name,
			&lesson.Description,
			&lesson.FileURL,
			&lesson.Content,
			&lesson.CourseID,
			&lesson.UserID,
			&lesson.CreatedAt,
			&lesson.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		lessons = append(lessons, lesson)
	}

	return lessons, nil
}

// Update updates a lesson
func (r *LessonRepository) Update(lesson *models.Lesson) error {
	query := `UPDATE lessons 
			  SET name = ?, description = ?, file_url = ?, content = ?, updated_at = ? 
			  WHERE id = ?`

	now := time.Now()
	_, err := r.db.Exec(query,
		lesson.Name,
		lesson.Description,
		lesson.FileURL,
		lesson.Content,
		now,
		lesson.ID,
	)

	if err != nil {
		return err
	}

	lesson.UpdatedAt = now
	return nil
}

// Delete deletes a lesson
func (r *LessonRepository) Delete(id int64) error {
	query := `DELETE FROM lessons WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

// GetCourseIDByLessonID retrieves the course ID for a lesson
func (r *LessonRepository) GetCourseIDByLessonID(lessonID int64) (int64, error) {
	var courseID int64
	query := `SELECT course_id FROM lessons WHERE id = ?`

	err := r.db.QueryRow(query, lessonID).Scan(&courseID)
	if err != nil {
		return 0, err
	}

	return courseID, nil
}
