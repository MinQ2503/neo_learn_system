package assignment

import "errors"

var (
	ErrAssignmentNotFound    = errors.New("assignment not found")
	ErrSubmissionNotFound    = errors.New("submission not found")
	ErrInvalidAssignmentData = errors.New("invalid assignment data")
	ErrUnauthorized          = errors.New("unauthorized")
	ErrCourseNotFound        = errors.New("course not found")
	ErrSubmissionExists      = errors.New("submission already exists")
	ErrDeadlinePassed        = errors.New("assignment deadline has passed")
	ErrNotYetStarted         = errors.New("assignment has not started yet")
)
