package profile

import (
	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type ProfileService struct {
	repo *ProfileRepository
}

func NewProfileService(repo *ProfileRepository) *ProfileService {
	return &ProfileService{repo: repo}
}

// GetProfileByUserID retrieves a profile by user ID
func (s *ProfileService) GetProfileByUserID(userID int64) (*models.Profile, error) {
	return s.repo.GetByUserID(userID)
}

// CreateProfile creates a new profile
func (s *ProfileService) CreateProfile(profile *models.Profile) error {
	// Validate profile data
	if profile.UserID == 0 {
		return ErrInvalidUserID
	}

	return s.repo.Create(profile)
}

// UpdateProfile updates an existing profile
func (s *ProfileService) UpdateProfile(profile *models.Profile) error {
	// Validate profile data
	if profile.UserID == 0 {
		return ErrInvalidUserID
	}

	// Check if profile exists
	existing, err := s.repo.GetByUserID(profile.UserID)
	if err != nil {
		return err
	}
	if existing == nil {
		return ErrProfileNotFound
	}

	return s.repo.Update(profile)
}

// DeleteProfile deletes a profile by user ID
func (s *ProfileService) DeleteProfile(userID int64) error {
	return s.repo.Delete(userID)
}

// CreateOrUpdateProfile creates a profile if it doesn't exist, otherwise updates it
func (s *ProfileService) CreateOrUpdateProfile(profile *models.Profile) error {
	existing, err := s.repo.GetByUserID(profile.UserID)
	if err != nil {
		return err
	}

	if existing == nil {
		return s.repo.Create(profile)
	}

	return s.repo.Update(profile)
}
