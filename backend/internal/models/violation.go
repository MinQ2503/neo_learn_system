package models

import "time"

// QuizAttemptViolation represents a cheating violation detected during a quiz attempt
type QuizAttemptViolation struct {
	ID                int64     `json:"id" db:"id"`
	UserQuizAttemptID int64     `json:"user_quiz_attempt_id" db:"user_quiz_attempt_id"`
	Type              string    `json:"type" db:"type"`   // e.g., "LOOK_AWAY", "MOBILE_DETECTED", "MULTI_FACE", etc.
	Level             int8      `json:"level" db:"level"` // 1=Low, 2=Medium, 3=High
	DetectedAt        time.Time `json:"detected_at" db:"detected_at"`
	EvidenceURL       *string   `json:"evidence_url,omitempty" db:"evidence_url"` // URL to the evidence image
}

// CreateViolationRequest represents the request to create a violation
type CreateViolationRequest struct {
	UserQuizAttemptID int64   `json:"user_quiz_attempt_id" binding:"required"`
	Type              string  `json:"type" binding:"required"`
	Level             int8    `json:"level" binding:"required,min=1,max=3"`
	EvidenceURL       *string `json:"evidence_url,omitempty"`
}

// Violation types constants
const (
	ViolationTypeLookAway       = "LOOK_AWAY"
	ViolationTypeMobileDetected = "MOBILE_DETECTED"
	ViolationTypeMultiFace      = "MULTI_FACE"
	ViolationTypeHeadphone      = "HEADPHONE"
	ViolationTypeNoFace         = "NO_FACE"
	ViolationTypeWrongPerson    = "WRONG_PERSON"
	ViolationTypeTabSwitch      = "TAB_SWITCH"
	ViolationTypeGazeOffScreen  = "GAZE_OFF_SCREEN"
)

// Violation levels
const (
	ViolationLevelLow    = 1
	ViolationLevelMedium = 2
	ViolationLevelHigh   = 3
)
