package course

import (
	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type CourseService struct {
	repo *CourseRepository
}

func NewCourseService(repo *CourseRepository) *CourseService {
	return &CourseService{repo: repo}
}

// CreateCourse creates a new course
func (s *CourseService) CreateCourse(course *models.Course) error {
	if course.Name == "" {
		return ErrInvalidCourseData
	}

	return s.repo.Create(course)
}

// GetCourse retrieves a course by ID
func (s *CourseService) GetCourse(id int64) (*models.Course, error) {
	return s.repo.GetByID(id)
}

// GetAllCourses retrieves all courses
func (s *CourseService) GetAllCourses() ([]*models.Course, error) {
	return s.repo.GetAll()
}

// GetCoursesByInstructor retrieves all courses by instructor
func (s *CourseService) GetCoursesByInstructor(instructorID int64) ([]*models.Course, error) {
	return s.repo.GetByInstructorID(instructorID)
}

// UpdateCourse updates a course
func (s *CourseService) UpdateCourse(course *models.Course, userID int64) error {
	existing, err := s.repo.GetByID(course.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return ErrCourseNotFound
	}

	// Check if user is the course instructor
	if existing.UserID != userID {
		return ErrUnauthorized
	}

	if course.Name == "" {
		return ErrInvalidCourseData
	}

	return s.repo.Update(course)
}

// DeleteCourse deletes a course
func (s *CourseService) DeleteCourse(id int64, userID int64) error {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	if existing == nil {
		return ErrCourseNotFound
	}

	// Check if user is the course instructor
	if existing.UserID != userID {
		return ErrUnauthorized
	}

	return s.repo.Delete(id)
}

// EnrollStudent enrolls a student in a course
func (s *CourseService) EnrollStudent(courseID, studentID int64) error {
	// Check if course exists
	course, err := s.repo.GetByID(courseID)
	if err != nil {
		return err
	}
	if course == nil {
		return ErrCourseNotFound
	}

	// Check if student is the instructor
	if course.UserID == studentID {
		return ErrCannotEnrollOwnCourse
	}

	// Check if already enrolled
	enrolled, err := s.repo.IsStudentEnrolled(courseID, studentID)
	if err != nil {
		return err
	}
	if enrolled {
		return ErrAlreadyEnrolled
	}

	return s.repo.EnrollStudent(courseID, studentID)
}

// UnenrollStudent removes a student from a course
func (s *CourseService) UnenrollStudent(courseID, studentID int64) error {
	// Check if enrolled
	enrolled, err := s.repo.IsStudentEnrolled(courseID, studentID)
	if err != nil {
		return err
	}
	if !enrolled {
		return ErrNotEnrolled
	}

	return s.repo.UnenrollStudent(courseID, studentID)
}

// GetEnrolledStudents retrieves all students enrolled in a course
func (s *CourseService) GetEnrolledStudents(courseID int64) ([]*models.User, error) {
	return s.repo.GetEnrolledStudents(courseID)
}

// GetEnrolledCourses retrieves all courses a student is enrolled in
func (s *CourseService) GetEnrolledCourses(userID int64) ([]*models.Course, error) {
	return s.repo.GetEnrolledCourses(userID)
}

// IsStudentEnrolled checks if a student is enrolled in a course
func (s *CourseService) IsStudentEnrolled(courseID, userID int64) (bool, error) {
	return s.repo.IsStudentEnrolled(courseID, userID)
}
