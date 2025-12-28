package course

import "errors"

var (
	ErrCourseNotFound        = errors.New("course not found")
	ErrInvalidCourseData     = errors.New("invalid course data")
	ErrUnauthorized          = errors.New("unauthorized")
	ErrAlreadyEnrolled       = errors.New("student already enrolled in this course")
	ErrNotEnrolled           = errors.New("student not enrolled in this course")
	ErrCannotEnrollOwnCourse = errors.New("instructor cannot enroll in their own course")
)
