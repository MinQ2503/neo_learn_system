package role

import "errors"

var (
	ErrRoleNotFound       = errors.New("role not found")
	ErrPermissionNotFound = errors.New("permission not found")
	ErrRoleExists         = errors.New("role already exists")
	ErrPermissionExists   = errors.New("permission already exists")
	ErrUnauthorized       = errors.New("unauthorized")
	ErrInvalidData        = errors.New("invalid data")
	ErrAlreadyAssigned    = errors.New("already assigned")
	ErrNotAssigned        = errors.New("not assigned")
)
