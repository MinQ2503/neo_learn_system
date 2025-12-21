package anti_cheating

import "mime/multipart"

// AntiCheatingService defines the interface for anti-cheating operations
type AntiCheatingService interface {
	// AddPersonToDatabase adds a new person to face recognition database
	AddPersonToDatabase(candidateID int64, candidateName string, imageFile *multipart.FileHeader) (*AddPersonResponse, error)

	// SyncAllUsersFromBackend syncs all users from profile_image_users to face database
	SyncAllUsersFromBackend() (*SyncAllResponse, error)

	// DeletePerson deletes a person from face database
	DeletePerson(candidateID int64) error

	// VerifyUser verifies if the person in the image matches the candidate ID
	VerifyUser(candidateID int64, imageFile *multipart.FileHeader) (*VerifyUserResponse, error)
}

// AddPersonResponse represents the response from add_new_person API
type AddPersonResponse struct {
	Message          string       `json:"message"`
	ImagePath        string       `json:"image_path"`
	DatabaseUsername string       `json:"database_username"`
	TotalImages      int          `json:"total_images"`
	ErrorImages      []ErrorImage `json:"error_images"`
}

// ErrorImage represents an error for a specific image
type ErrorImage struct {
	Image string `json:"image"`
	Error string `json:"error"`
}

// SyncAllResponse represents the response from sync_all_users_from_backend API
type SyncAllResponse struct {
	Message      string       `json:"message"`
	TotalSuccess int          `json:"total_success"`
	TotalFailed  int          `json:"total_failed"`
	Results      []SyncResult `json:"results"`
}

// SyncResult represents the result for a single user sync
type SyncResult struct {
	CandidateID string       `json:"candidate_id"`
	Status      string       `json:"status"`
	ErrorImages []ErrorImage `json:"error_images,omitempty"`
	Error       string       `json:"error,omitempty"`
}

// VerifyUserResponse represents the response from verify_user API
type VerifyUserResponse struct {
	IsValid     bool   `json:"is_valid"`
	CandidateID int64  `json:"candidate_id"`
	Message     string `json:"message,omitempty"`
}
