package assignment

import (
	"time"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type CourseRepository interface {
	GetByID(id int64) (*models.Course, error)
	IsStudentEnrolled(courseID, userID int64) (bool, error)
}

type AssignmentService struct {
	repo       *AssignmentRepository
	courseRepo CourseRepository
}

func NewAssignmentService(repo *AssignmentRepository, courseRepo CourseRepository) *AssignmentService {
	return &AssignmentService{
		repo:       repo,
		courseRepo: courseRepo,
	}
}

// CreateAssignment creates a new assignment
func (s *AssignmentService) CreateAssignment(assignment *models.Assignment, userID int64) error {
	if assignment.Name == "" {
		return ErrInvalidAssignmentData
	}

	// Check if course exists
	course, err := s.courseRepo.GetByID(assignment.CourseID)
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

	assignment.UserID = userID
	return s.repo.Create(assignment)
}

// GetAssignment retrieves an assignment by ID
func (s *AssignmentService) GetAssignment(id int64) (*models.Assignment, error) {
	return s.repo.GetByID(id)
}

// GetAssignmentsByCourse retrieves all assignments for a course
func (s *AssignmentService) GetAssignmentsByCourse(courseID int64) ([]*models.Assignment, error) {
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

// UpdateAssignment updates an assignment
func (s *AssignmentService) UpdateAssignment(assignment *models.Assignment, userID int64) error {
	if assignment.Name == "" {
		return ErrInvalidAssignmentData
	}

	// Check if assignment exists
	existing, err := s.repo.GetByID(assignment.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return ErrAssignmentNotFound
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

	// Preserve the course_id and user_id from existing assignment
	assignment.CourseID = existing.CourseID
	assignment.UserID = existing.UserID

	return s.repo.Update(assignment)
}

// DeleteAssignment deletes an assignment
func (s *AssignmentService) DeleteAssignment(id int64, userID int64) error {
	// Check if assignment exists
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	if existing == nil {
		return ErrAssignmentNotFound
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

// SubmitAssignment submits an assignment
func (s *AssignmentService) SubmitAssignment(submission *models.AssignmentSubmission, userID int64) error {
	// Check if assignment exists
	assignment, err := s.repo.GetByID(submission.AssignmentID)
	if err != nil {
		return err
	}
	if assignment == nil {
		return ErrAssignmentNotFound
	}

	// Check if student is enrolled in the course
	enrolled, err := s.courseRepo.IsStudentEnrolled(assignment.CourseID, userID)
	if err != nil {
		return err
	}
	if !enrolled {
		return ErrUnauthorized
	}

	// Check if assignment has started
	now := time.Now()
	if now.Before(assignment.StartTime) {
		return ErrNotYetStarted
	}

	// Check if deadline has passed
	if now.After(assignment.DueTime) {
		return ErrDeadlinePassed
	}

	// Check if submission already exists
	existing, err := s.repo.GetSubmissionByAssignmentAndUser(submission.AssignmentID, userID)
	if err != nil {
		return err
	}

	submission.UserID = userID
	submission.Status = 0 // pending

	if existing != nil {
		// Update existing submission
		submission.ID = existing.ID
		return s.repo.UpdateSubmission(submission)
	}

	// Create new submission
	return s.repo.CreateSubmission(submission)
}

// GetSubmission retrieves a submission by ID
func (s *AssignmentService) GetSubmission(id int64) (*models.AssignmentSubmission, error) {
	return s.repo.GetSubmissionByID(id)
}

// GetMySubmission retrieves a student's submission for an assignment
func (s *AssignmentService) GetMySubmission(assignmentID, userID int64) (*models.AssignmentSubmission, error) {
	return s.repo.GetSubmissionByAssignmentAndUser(assignmentID, userID)
}

// GetSubmissionsByAssignment retrieves all submissions for an assignment
func (s *AssignmentService) GetSubmissionsByAssignment(assignmentID, userID int64) ([]*models.AssignmentSubmission, error) {
	// Check if assignment exists
	assignment, err := s.repo.GetByID(assignmentID)
	if err != nil {
		return nil, err
	}
	if assignment == nil {
		return nil, ErrAssignmentNotFound
	}

	// Get course to check authorization
	course, err := s.courseRepo.GetByID(assignment.CourseID)
	if err != nil {
		return nil, err
	}
	if course == nil {
		return nil, ErrCourseNotFound
	}

	// Check if user is the course instructor
	if course.UserID != userID {
		return nil, ErrUnauthorized
	}

	return s.repo.GetSubmissionsByAssignment(assignmentID)
}

// GradeSubmission grades a submission
func (s *AssignmentService) GradeSubmission(submissionID int64, score int, feedback string, gradedBy int64) error {
	// Check if submission exists
	submission, err := s.repo.GetSubmissionByID(submissionID)
	if err != nil {
		return err
	}
	if submission == nil {
		return ErrSubmissionNotFound
	}

	// Get assignment to check authorization
	assignment, err := s.repo.GetByID(submission.AssignmentID)
	if err != nil {
		return err
	}
	if assignment == nil {
		return ErrAssignmentNotFound
	}

	// Get course to check authorization
	course, err := s.courseRepo.GetByID(assignment.CourseID)
	if err != nil {
		return err
	}
	if course == nil {
		return ErrCourseNotFound
	}

	// Check if user is the course instructor
	if course.UserID != gradedBy {
		return ErrUnauthorized
	}

	return s.repo.GradeSubmission(submissionID, score, feedback, gradedBy)
}
