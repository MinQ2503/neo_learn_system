package models

import (
	"time"
)

// Course represents a course in the system
type Course struct {
	ID          int64     `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	UserID      int64     `json:"user_id" db:"user_id"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
	// Relationships
	Instructor *User `json:"instructor,omitempty" db:"-"`
}

// CourseEnrollment represents a student enrollment in a course
type CourseEnrollment struct {
	ID        int64     `json:"id" db:"id"`
	CourseID  int64     `json:"course_id" db:"course_id"`
	UserID    int64     `json:"user_id" db:"user_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	// Relationships
	Course *Course `json:"course,omitempty" db:"-"`
	User   *User   `json:"user,omitempty" db:"-"`
}

// Lesson represents a lesson within a course
type Lesson struct {
	ID          int64     `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	FileURL     string    `json:"file_url" db:"file_url"`
	Content     string    `json:"content" db:"content"`
	CourseID    int64     `json:"course_id" db:"course_id"`
	UserID      int64     `json:"user_id" db:"user_id"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
	// Relationships
	Course *Course `json:"course,omitempty" db:"-"`
	Author *User   `json:"author,omitempty" db:"-"`
}
