package lesson

import (
	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type CourseRepository interface {
	GetByID(id int64) (*models.Course, error)
}

type LessonService struct {
	repo       *LessonRepository
	courseRepo CourseRepository
}

func NewLessonService(repo *LessonRepository, courseRepo CourseRepository) *LessonService {
	return &LessonService{
		repo:       repo,
		courseRepo: courseRepo,
	}
}

// CreateLesson creates a new lesson
func (s *LessonService) CreateLesson(lesson *models.Lesson, userID int64) error {
	if lesson.Name == "" {
		return ErrInvalidLessonData
	}

	// Check if course exists
	course, err := s.courseRepo.GetByID(lesson.CourseID)
	if err != nil {
		return err
	}
	if course == nil {
		return ErrCourseNotFound
	}

	// Check if user is the course instructor
	if course.UserID != userID {
		return ErrUnauthorized
	}

	lesson.UserID = userID
	return s.repo.Create(lesson)
}

// GetLesson retrieves a lesson by ID
func (s *LessonService) GetLesson(id int64) (*models.Lesson, error) {
	return s.repo.GetByID(id)
}

// GetLessonsByCourse retrieves all lessons for a course
func (s *LessonService) GetLessonsByCourse(courseID int64) ([]*models.Lesson, error) {
	// Check if course exists
	course, err := s.courseRepo.GetByID(courseID)
	if err != nil {
		return nil, err
	}
	if course == nil {
		return nil, ErrCourseNotFound
	}

	return s.repo.GetByCourseID(courseID)
}

// UpdateLesson updates a lesson
func (s *LessonService) UpdateLesson(lesson *models.Lesson, userID int64) error {
	if lesson.Name == "" {
		return ErrInvalidLessonData
	}

	// Check if lesson exists
	existing, err := s.repo.GetByID(lesson.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return ErrLessonNotFound
	}

	// Get course to check authorization
	course, err := s.courseRepo.GetByID(existing.CourseID)
	if err != nil {
		return err
	}
	if course == nil {
		return ErrCourseNotFound
	}

	// Check if user is the course instructor
	if course.UserID != userID {
		return ErrUnauthorized
	}

	// Preserve the course_id and user_id from existing lesson
	lesson.CourseID = existing.CourseID
	lesson.UserID = existing.UserID

	return s.repo.Update(lesson)
}

// DeleteLesson deletes a lesson
func (s *LessonService) DeleteLesson(id int64, userID int64) error {
	// Check if lesson exists
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	if existing == nil {
		return ErrLessonNotFound
	}

	// Get course to check authorization
	course, err := s.courseRepo.GetByID(existing.CourseID)
	if err != nil {
		return err
	}
	if course == nil {
		return ErrCourseNotFound
	}

	// Check if user is the course instructor
	if course.UserID != userID {
		return ErrUnauthorized
	}

	return s.repo.Delete(id)
}
