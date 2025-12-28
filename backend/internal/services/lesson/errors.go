package lesson

import "errors"

var (
	ErrLessonNotFound    = errors.New("lesson not found")
	ErrInvalidLessonData = errors.New("invalid lesson data")
	ErrUnauthorized      = errors.New("unauthorized")
	ErrCourseNotFound    = errors.New("course not found")
)
