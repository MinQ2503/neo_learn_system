package quiz

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type Service struct {
	repo             *Repository
	antiCheatBaseURL string
	httpClient       *http.Client
}

func NewService(repo *Repository, antiCheatBaseURL string) *Service {
	return &Service{
		repo:             repo,
		antiCheatBaseURL: antiCheatBaseURL,
		httpClient:       &http.Client{},
	}
}

// CheckUserHasProfileImage checks if user has uploaded profile image
func (s *Service) CheckUserHasProfileImage(userID int64) (bool, error) {
	return s.repo.CheckUserHasProfileImage(userID)
}

// StartQuizAttempt starts a new quiz attempt
func (s *Service) StartQuizAttempt(userID, quizID int64) (*models.UserQuizAttempt, error) {
	// 1. Check if quiz exists
	quiz, err := s.repo.GetQuizByID(quizID)
	if err != nil {
		return nil, fmt.Errorf("quiz not found: %w", err)
	}

	// 2. Check if user is enrolled in the course
	enrolled, err := s.repo.CheckUserEnrolledInCourse(userID, quiz.CourseID)
	if err != nil {
		return nil, fmt.Errorf("failed to check enrollment: %w", err)
	}
	if !enrolled {
		return nil, fmt.Errorf("user is not enrolled in this course")
	}

	// 3. Check if user has profile image (if face recognition is enabled)
	if quiz.EnableFaceRecognition {
		hasImage, err := s.repo.CheckUserHasProfileImage(userID)
		if err != nil {
			return nil, fmt.Errorf("failed to check profile image: %w", err)
		}
		if !hasImage {
			return nil, fmt.Errorf("user must upload profile image before taking quiz")
		}
	}

	// 4. Check max attempts
	attemptCount, err := s.repo.CountUserQuizAttempts(quizID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to count attempts: %w", err)
	}
	if attemptCount >= quiz.MaxAttempts {
		return nil, fmt.Errorf("maximum attempts reached")
	}

	// 5. Create new attempt
	attempt := &models.UserQuizAttempt{
		QuizID: quizID,
		UserID: userID,
	}

	err = s.repo.CreateQuizAttempt(attempt)
	if err != nil {
		return nil, fmt.Errorf("failed to create attempt: %w", err)
	}

	return attempt, nil
}

// DetectCheatingResponse from anti-cheating service
type DetectCheatingResponse struct {
	CandidateID          string  `json:"candidate_id"`
	CandidateName        string  `json:"candidate_name"`
	Message              string  `json:"message"`
	CheatingDetected     bool    `json:"cheating_detected"`
	CheatingReason       string  `json:"cheating_reason"`
	MultiplePersons      bool    `json:"multiple_persons"`
	MultipleFaces        int     `json:"multiple_faces"`
	NoFaceDetected       bool    `json:"no_face_detected"`
	NotMatchingCandidate bool    `json:"not_matching_candidate"`
	UnknownPerson        bool    `json:"unknown_person"`
	MatchedPersonName    string  `json:"matched_person_name"`
	Similarity           float64 `json:"similarity"`
	ConfidenceScore      float64 `json:"confidence_score"`
	HeadphoneDetected    bool    `json:"headphone_detected"`
	HeadphoneName        string  `json:"headphone_name"`
	HeadphoneConfidence  float64 `json:"headphone_confidence"`
	CellphoneDetected    bool    `json:"cellphone_detected"`
	CellphoneName        string  `json:"cellphone_name"`
	CellphoneConfidence  float64 `json:"cellphone_confidence"`
	IsSpoofing           bool    `json:"is_spoofing"`
	SpoofingScore        float64 `json:"spoofing_score"`
	IsLookingAway        bool    `json:"is_looking_away"`
	PitchAngle           float64 `json:"pitch_angle"`
	YawAngle             float64 `json:"yaw_angle"`
	GazeAngle            float64 `json:"gaze_angle"`
	TotalViolationPoint  float64 `json:"total_violation_point"`
	DetectionTimestamp   string  `json:"detection_timestamp"`
	SavedImagePath       string  `json:"saved_image_path"`
	SavedImageURL        string  `json:"saved_image_url"`
	ProcessingTime       float64 `json:"processing_time"`
}

// SubmitFrame submits a frame for cheating detection
func (s *Service) SubmitFrame(attemptID int64, userID int64, imageData []byte, filename string) (*DetectCheatingResponse, error) {
	// 1. Get attempt info
	attempt, err := s.repo.GetQuizAttemptByID(attemptID)
	if err != nil {
		return nil, fmt.Errorf("attempt not found: %w", err)
	}

	// Verify user owns this attempt
	if attempt.UserID != userID {
		return nil, fmt.Errorf("unauthorized: attempt does not belong to user")
	}

	// 2. Get quiz info
	quiz, err := s.repo.GetQuizByID(attempt.QuizID)
	if err != nil {
		return nil, fmt.Errorf("quiz not found: %w", err)
	}

	// If anti-cheat is not enabled, return success
	if !quiz.EnableAntiCheat {
		return &DetectCheatingResponse{
			Message:          "Anti-cheat not enabled",
			CheatingDetected: false,
		}, nil
	}

	// 3. Call anti-cheating service
	fmt.Printf("\n=== Quiz Attempt Info ===\n")
	fmt.Printf("User ID: %d\n", userID)
	fmt.Printf("Attempt ID: %d\n", attemptID)
	fmt.Printf("Quiz ID: %d\n", quiz.ID)
	fmt.Printf("Filename: %s\n", filename)
	fmt.Printf("========================\n\n")

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Add candidate_id
	if err := writer.WriteField("candidate_id", fmt.Sprintf("%d", userID)); err != nil {
		return nil, fmt.Errorf("failed to write candidate_id: %w", err)
	}

	// Add quiz_attempt_id for folder structure
	if err := writer.WriteField("quiz_attempt_id", fmt.Sprintf("%d", attemptID)); err != nil {
		return nil, fmt.Errorf("failed to write quiz_attempt_id: %w", err)
	}

	// Add file
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return nil, fmt.Errorf("failed to create form file: %w", err)
	}
	if _, err := part.Write(imageData); err != nil {
		return nil, fmt.Errorf("failed to write file: %w", err)
	}

	cheatWeights := map[string]interface{}{
		// Face related
		"no_face":        3.0, // Không thấy mặt (mức trung bình)
		"multiple_faces": 8.0, // Nhiều người (rất nặng)
		"unknown_person": 8.0, // Sai người dự thi

		// Behavior
		"gaze_off_screen": 2.0, // Nhìn lệch (nhẹ)

		// Devices
		"cellphone_detected": 10.0, // Điện thoại (cực nặng)
		"headphone_detected": 4.0,  // Tai nghe (trung bình)

		// Anti-spoof
		"spoofing": 10.0, // Fake ảnh / video (cực nặng)

		// Decision
		"threshold": 1.0, // >= 8 điểm → cheating_detected = true
	}

	cheatWeightsJSON, _ := json.Marshal(cheatWeights)
	if err := writer.WriteField("cheat_weights_str", string(cheatWeightsJSON)); err != nil {
		return nil, fmt.Errorf("failed to write cheat_weights: %w", err)
	}

	writer.Close()

	// Create request - using new endpoint /detect_quiz_exam
	url := fmt.Sprintf("%s/detect_quiz_exam", s.antiCheatBaseURL)
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	// Send request
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// Read response
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned error status %d: %s", resp.StatusCode, string(respBody))
	}

	var result DetectCheatingResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	// Log detection result
	fmt.Printf("\n=== Detection Result ===\n")
	fmt.Printf("Cheating Detected: %v\n", result.CheatingDetected)
	fmt.Printf("Cheating Reason: %s\n", result.CheatingReason)
	fmt.Printf("User ID: %d\n", userID)
	fmt.Printf("========================\n\n")

	// 4. If cheating detected, create violation record(s)
	if result.CheatingDetected {
		// Collect all violations detected
		violations := []struct {
			Type  string
			Level int
		}{}

		// Check all violation types (not using else if to catch all violations)
		if result.MultiplePersons {
			violations = append(violations, struct {
				Type  string
				Level int
			}{"MULTIPLE_PERSONS", 3})
		}
		if result.NoFaceDetected {
			violations = append(violations, struct {
				Type  string
				Level int
			}{"NO_FACE_DETECTED", 2})
		}
		if result.NotMatchingCandidate {
			violations = append(violations, struct {
				Type  string
				Level int
			}{"NOT_MATCHING_CANDIDATE", 3})
		}
		if result.HeadphoneDetected && !quiz.AllowHeadphone {
			violations = append(violations, struct {
				Type  string
				Level int
			}{"HEADPHONE_DETECTED", 2})
		}
		if result.CellphoneDetected {
			violations = append(violations, struct {
				Type  string
				Level int
			}{"CELLPHONE_DETECTED", 3})
		}
		if result.IsSpoofing {
			violations = append(violations, struct {
				Type  string
				Level int
			}{"SPOOFING", 3})
		}
		if result.IsLookingAway {
			violations = append(violations, struct {
				Type  string
				Level int
			}{"LOOKING_AWAY", 1})
		}

		// Save all violations
		for _, v := range violations {
			violation := &models.QuizAttemptViolation{
				UserQuizAttemptID: attemptID,
				Type:              v.Type,
				Level:             v.Level,
			}

			// Set evidence URL if available
			if result.SavedImagePath != "" {
				violation.EvidenceURL = &result.SavedImagePath
			}

			// Save violation
			if err := s.repo.CreateViolation(violation); err != nil {
				return nil, fmt.Errorf("failed to save violation %s: %w", v.Type, err)
			}

			fmt.Printf("✅ Saved violation: %s (Level %d)\n", v.Type, v.Level)
		}

		// Check if max violations reached
		violationCount, err := s.repo.GetViolationCount(attemptID)
		if err != nil {
			return nil, fmt.Errorf("failed to get violation count: %w", err)
		}

		if violationCount >= quiz.MaxViolations {
			// TODO: Automatically terminate the quiz attempt
			result.Message = fmt.Sprintf("Maximum violations reached (%d/%d). Quiz will be terminated.", violationCount, quiz.MaxViolations)
		}
	}

	return &result, nil
}

// GetViolationCount gets violation count for an attempt
func (s *Service) GetViolationCount(attemptID int64) (int, error) {
	return s.repo.GetViolationCount(attemptID)
}
