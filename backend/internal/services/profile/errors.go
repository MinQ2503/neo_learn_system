package profile

import "errors"

var (
	ErrInvalidUserID   = errors.New("invalid user ID")
	ErrProfileNotFound = errors.New("profile not found")
	ErrProfileExists   = errors.New("profile already exists")
	ErrUnauthorized    = errors.New("unauthorized")
)
