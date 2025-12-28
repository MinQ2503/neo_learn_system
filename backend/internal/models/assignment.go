package models

import (
	"time"
)

// Assignment represents a homework assignment in a course
type Assignment struct {
	ID          int64     `json:"id" db:"id"`
	CourseID    int64     `json:"course_id" db:"course_id"`
	UserID      int64     `json:"user_id" db:"user_id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	StartTime   time.Time `json:"start_time" db:"start_time"`
	DueTime     time.Time `json:"due_time" db:"due_time"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
	// Relationships
	Course     *Course `json:"course,omitempty" db:"-"`
	Instructor *User   `json:"instructor,omitempty" db:"-"`
}

// AssignmentSubmission represents a student's submission for an assignment
type AssignmentSubmission struct {
	ID           int64     `json:"id" db:"id"`
	AssignmentID int64     `json:"assignment_id" db:"assignment_id"`
	UserID       int64     `json:"user_id" db:"user_id"`
	FilePath     string    `json:"file_path" db:"file_path"`
	Score        *int      `json:"score" db:"score"`
	Feedback     string    `json:"feedback" db:"feedback"`
	Status       int       `json:"status" db:"status"` // 0: pending, 1: graded
	GradedBy     *int64    `json:"graded_by" db:"graded_by"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
	// Relationships
	Assignment *Assignment `json:"assignment,omitempty" db:"-"`
	Student    *User       `json:"student,omitempty" db:"-"`
	Grader     *User       `json:"grader,omitempty" db:"-"`
}
