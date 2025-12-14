package auth

import (
	"errors"
	"time"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
	"github.com/MinQ2503/neo_learn_system/backend/internal/utils"
)

type AuthService struct {
	userRepo      *UserRepository
	jwtExpiration time.Duration
}

func NewAuthService(userRepo *UserRepository, jwtExpiration time.Duration) *AuthService {
	return &AuthService{
		userRepo:      userRepo,
		jwtExpiration: jwtExpiration,
	}
}

// Register creates a new user account
func (s *AuthService) Register(req *models.RegisterRequest) (*models.User, error) {
	// Check if user already exists
	existingUser, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, errors.New("email already registered")
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
		Status:   1, // Active
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	// Assign default "student" role
	studentRole, err := s.userRepo.GetRoleByName("student")
	if err != nil {
		return nil, err
	}
	if studentRole != nil {
		if err := s.userRepo.AssignRole(user.ID, studentRole.ID); err != nil {
			return nil, err
		}
	}

	return user, nil
}

// Login authenticates a user and returns a token
func (s *AuthService) Login(req *models.LoginRequest) (*models.LoginResponse, error) {
	// Find user by email
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("invalid email or password")
	}

	// Check password
	if !utils.CheckPassword(user.Password, req.Password) {
		return nil, errors.New("invalid email or password")
	}

	// Get user roles
	roles, err := s.userRepo.GetUserRoles(user.ID)
	if err != nil {
		return nil, err
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email, roles, s.jwtExpiration)
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		Token: token,
		User: models.UserInfo{
			ID:    user.ID,
			Name:  user.Name,
			Email: user.Email,
			Roles: roles,
		},
	}, nil
}

// GetUserByID retrieves user information by ID
func (s *AuthService) GetUserByID(userID int64) (*models.UserInfo, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found")
	}

	roles, err := s.userRepo.GetUserRoles(user.ID)
	if err != nil {
		return nil, err
	}

	return &models.UserInfo{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		Roles: roles,
	}, nil
}

// ChangePassword changes user password
func (s *AuthService) ChangePassword(userID int64, req *models.ChangePasswordRequest) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("user not found")
	}

	// Check old password
	if !utils.CheckPassword(user.Password, req.OldPassword) {
		return errors.New("invalid old password")
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return err
	}

	// Update password
	return s.userRepo.UpdatePassword(userID, hashedPassword)
}
