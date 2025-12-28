package course

import (
	"database/sql"
	"time"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type CourseRepository struct {
	db *sql.DB
}

func NewCourseRepository(db *sql.DB) *CourseRepository {
	return &CourseRepository{db: db}
}

// Create creates a new course
func (r *CourseRepository) Create(course *models.Course) error {
	query := `INSERT INTO courses (name, description, user_id, created_at, updated_at) 
			  VALUES (?, ?, ?, ?, ?)`

	now := time.Now()
	result, err := r.db.Exec(query, course.Name, course.Description, course.UserID, now, now)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	course.ID = id
	course.CreatedAt = now
	course.UpdatedAt = now
	return nil
}

// GetByID retrieves a course by ID
func (r *CourseRepository) GetByID(id int64) (*models.Course, error) {
	course := &models.Course{}
	query := `SELECT id, name, description, user_id, created_at, updated_at 
			  FROM courses WHERE id = ?`

	err := r.db.QueryRow(query, id).Scan(
		&course.ID, &course.Name, &course.Description,
		&course.UserID, &course.CreatedAt, &course.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return course, nil
}

// GetAll retrieves all courses
func (r *CourseRepository) GetAll() ([]*models.Course, error) {
	query := `SELECT id, name, description, user_id, created_at, updated_at FROM courses`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []*models.Course
	for rows.Next() {
		course := &models.Course{}
		err := rows.Scan(
			&course.ID, &course.Name, &course.Description,
			&course.UserID, &course.CreatedAt, &course.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		courses = append(courses, course)
	}

	return courses, nil
}

// GetByInstructorID retrieves all courses by instructor ID
func (r *CourseRepository) GetByInstructorID(instructorID int64) ([]*models.Course, error) {
	query := `SELECT id, name, description, user_id, created_at, updated_at 
			  FROM courses WHERE user_id = ?`

	rows, err := r.db.Query(query, instructorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []*models.Course
	for rows.Next() {
		course := &models.Course{}
		err := rows.Scan(
			&course.ID, &course.Name, &course.Description,
			&course.UserID, &course.CreatedAt, &course.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		courses = append(courses, course)
	}

	return courses, nil
}

// Update updates a course
func (r *CourseRepository) Update(course *models.Course) error {
	query := `UPDATE courses SET name = ?, description = ?, updated_at = ? WHERE id = ?`

	now := time.Now()
	_, err := r.db.Exec(query, course.Name, course.Description, now, course.ID)
	if err != nil {
		return err
	}

	course.UpdatedAt = now
	return nil
}

// Delete deletes a course
func (r *CourseRepository) Delete(id int64) error {
	query := `DELETE FROM courses WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

// EnrollStudent enrolls a student in a course
func (r *CourseRepository) EnrollStudent(courseID, userID int64) error {
	query := `INSERT INTO course_enrollments (course_id, user_id, created_at, updated_at) 
			  VALUES (?, ?, ?, ?)`

	now := time.Now()
	_, err := r.db.Exec(query, courseID, userID, now, now)
	return err
}

// UnenrollStudent removes a student from a course
func (r *CourseRepository) UnenrollStudent(courseID, userID int64) error {
	query := `DELETE FROM course_enrollments WHERE course_id = ? AND user_id = ?`
	_, err := r.db.Exec(query, courseID, userID)
	return err
}

// IsStudentEnrolled checks if a student is enrolled in a course
func (r *CourseRepository) IsStudentEnrolled(courseID, userID int64) (bool, error) {
	query := `SELECT COUNT(*) FROM course_enrollments WHERE course_id = ? AND user_id = ?`

	var count int
	err := r.db.QueryRow(query, courseID, userID).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// GetEnrolledStudents retrieves all students enrolled in a course
func (r *CourseRepository) GetEnrolledStudents(courseID int64) ([]*models.User, error) {
	query := `SELECT u.id, u.name, u.email, u.created_at, u.updated_at 
			  FROM users u
			  INNER JOIN course_enrollments ce ON u.id = ce.user_id
			  WHERE ce.course_id = ?`

	rows, err := r.db.Query(query, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var students []*models.User
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(&user.ID, &user.Name, &user.Email, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, err
		}
		students = append(students, user)
	}

	return students, nil
}

// GetEnrolledCourses retrieves all courses a student is enrolled in
func (r *CourseRepository) GetEnrolledCourses(userID int64) ([]*models.Course, error) {
	query := `SELECT c.id, c.name, c.description, c.user_id, c.created_at, c.updated_at 
			  FROM courses c
			  INNER JOIN course_enrollments ce ON c.id = ce.course_id
			  WHERE ce.user_id = ?`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []*models.Course
	for rows.Next() {
		course := &models.Course{}
		err := rows.Scan(
			&course.ID, &course.Name, &course.Description,
			&course.UserID, &course.CreatedAt, &course.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		courses = append(courses, course)
	}

	return courses, nil
}
