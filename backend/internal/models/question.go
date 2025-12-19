package models

import "time"

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
