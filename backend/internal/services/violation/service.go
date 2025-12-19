package violation

import (
	"errors"
	"time"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type ViolationService struct {
	repo *ViolationRepository
}

func NewViolationService(repo *ViolationRepository) *ViolationService {
	return &ViolationService{repo: repo}
}

// CreateViolation creates a new violation
func (s *ViolationService) CreateViolation(req *models.CreateViolationRequest) (*models.QuizAttemptViolation, error) {
	// Validate violation type
	validTypes := map[string]bool{
		models.ViolationTypeLookAway:       true,
		models.ViolationTypeMobileDetected: true,
		models.ViolationTypeMultiFace:      true,
		models.ViolationTypeHeadphone:      true,
		models.ViolationTypeNoFace:         true,
		models.ViolationTypeWrongPerson:    true,
		models.ViolationTypeTabSwitch:      true,
		models.ViolationTypeGazeOffScreen:  true,
	}

	if !validTypes[req.Type] {
		return nil, errors.New("invalid violation type")
	}

	// Validate level
	if req.Level < 1 || req.Level > 3 {
		return nil, errors.New("violation level must be between 1 and 3")
	}

	violation := &models.QuizAttemptViolation{
		UserQuizAttemptID: req.UserQuizAttemptID,
		Type:              req.Type,
		Level:             req.Level,
		DetectedAt:        time.Now(),
		EvidenceURL:       req.EvidenceURL,
	}

	if err := s.repo.Create(violation); err != nil {
		return nil, err
	}

	return violation, nil
}

// CreateViolationsBatch creates multiple violations at once
func (s *ViolationService) CreateViolationsBatch(requests []models.CreateViolationRequest) ([]models.QuizAttemptViolation, error) {
	violations := make([]models.QuizAttemptViolation, 0, len(requests))

	validTypes := map[string]bool{
		models.ViolationTypeLookAway:       true,
		models.ViolationTypeMobileDetected: true,
		models.ViolationTypeMultiFace:      true,
		models.ViolationTypeHeadphone:      true,
		models.ViolationTypeNoFace:         true,
		models.ViolationTypeWrongPerson:    true,
		models.ViolationTypeTabSwitch:      true,
		models.ViolationTypeGazeOffScreen:  true,
	}

	now := time.Now()
	for _, req := range requests {
		if !validTypes[req.Type] {
			continue // Skip invalid types
		}
		if req.Level < 1 || req.Level > 3 {
			req.Level = 1 // Default to low
		}

		violation := models.QuizAttemptViolation{
			UserQuizAttemptID: req.UserQuizAttemptID,
			Type:              req.Type,
			Level:             req.Level,
			DetectedAt:        now,
			EvidenceURL:       req.EvidenceURL,
		}
		violations = append(violations, violation)
	}

	if len(violations) == 0 {
		return nil, errors.New("no valid violations to create")
	}

	if err := s.repo.CreateBatch(violations); err != nil {
		return nil, err
	}

	return violations, nil
}

// GetViolationsByAttemptID retrieves all violations for a quiz attempt
func (s *ViolationService) GetViolationsByAttemptID(attemptID int64) ([]models.QuizAttemptViolation, error) {
	return s.repo.GetByAttemptID(attemptID)
}

// GetViolationByID retrieves a violation by ID
func (s *ViolationService) GetViolationByID(id int64) (*models.QuizAttemptViolation, error) {
	return s.repo.GetByID(id)
}

// CountViolationsByAttemptID counts violations for an attempt
func (s *ViolationService) CountViolationsByAttemptID(attemptID int64) (int, error) {
	return s.repo.CountByAttemptID(attemptID)
}

