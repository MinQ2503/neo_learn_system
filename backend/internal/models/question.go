package models

import "time"

// Quiz represents a quiz/exam
type Quiz struct {
	ID                    int64      `json:"id" db:"id"`
	CourseID              int64      `json:"course_id" db:"course_id"`
	UserID                *int64     `json:"user_id,omitempty" db:"user_id"`
	Name                  string     `json:"name" db:"name"`
	Description           string     `json:"description" db:"description"`
	StartTime             *time.Time `json:"start_time,omitempty" db:"start_time"`
	EndTime               *time.Time `json:"end_time,omitempty" db:"end_time"`
	Minute                int        `json:"minute" db:"minute"`
	EnableFaceRecognition bool       `json:"enable_face_recognition" db:"enable_face_recognition"`
	EnableAntiCheat       bool       `json:"enable_anti_cheat" db:"enable_anti_cheat"`
	MaxViolations         int        `json:"max_violations" db:"max_violations"`
	AllowHeadphone        bool       `json:"allow_headphone" db:"allow_headphone"`
	MaxAttempts           int        `json:"max_attempts" db:"max_attempts"`
	ShuffleQuestions      bool       `json:"shuffle_questions" db:"shuffle_questions"`
	AllowReview           bool       `json:"allow_review" db:"allow_review"`
	CreatedAt             time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at" db:"updated_at"`
}

type QuizQuestion struct {
	ID        int64                `json:"id" form:"id" db:"id"`
	QuizID    int64                `json:"quiz_id" form:"quiz_id" db:"quiz_id"`
	Question  string               `json:"question" form:"question" db:"question"`
	CreatedAt time.Time            `json:"created_at" form:"created_at" db:"created_at"`
	UpdatedAt time.Time            `json:"updated_at" form:"updated_at" db:"updated_at"`
	Answers   []QuizQuestionAnswer `json:"answers,omitempty" db:"-"`
}

type QuizQuestionAnswer struct {
	ID             int64     `json:"id" form:"id" db:"id"`
	QuizQuestionID int64     `json:"quiz_question_id" form:"quiz_question_id" db:"quiz_question_id"`
	Answer         string    `json:"answer" form:"answer" db:"answer"`
	IsCorrect      bool      `json:"is_correct" form:"is_correct" db:"is_correct"`
	Point          int       `json:"point" form:"point" db:"point"`
	CreatedAt      time.Time `json:"created_at" form:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" form:"updated_at" db:"updated_at"`
}

// UserQuizAttempt represents a student's quiz attempt
type UserQuizAttempt struct {
	ID        int64     `json:"id" db:"id"`
	QuizID    int64     `json:"quiz_id" db:"quiz_id"`
	UserID    int64     `json:"user_id" db:"user_id"`
	Score     *int      `json:"score,omitempty" db:"score"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// UserQuizAttemptDetail represents answer detail for each question
type UserQuizAttemptDetail struct {
	ID                int64     `json:"id" db:"id"`
	QuizQuestionID    int64     `json:"quiz_question_id" db:"quiz_question_id"`
	UserQuizAttemptID int64     `json:"user_quiz_attempt_id" db:"user_quiz_attempt_id"`
	SelectedOptionID  *int64    `json:"selected_option_id,omitempty" db:"selected_option_id"`
	Score             *int      `json:"score,omitempty" db:"score"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}

// QuizAttemptViolation represents a cheating violation detected during quiz
type QuizAttemptViolation struct {
	ID                int64     `json:"id" db:"id"`
	UserQuizAttemptID int64     `json:"user_quiz_attempt_id" db:"user_quiz_attempt_id"`
	Type              string    `json:"type" db:"type"`
	Level             int       `json:"level" db:"level"`
	DetectedAt        time.Time `json:"detected_at" db:"detected_at"`
	EvidenceURL       *string   `json:"evidence_url,omitempty" db:"evidence_url"`
}
