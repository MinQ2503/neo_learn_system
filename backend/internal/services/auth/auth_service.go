package auth

import (
	"database/sql"
	"errors"
	"mime/multipart"
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
func (s *AuthService) Register(req *models.RegisterRequest, avatarFile *multipart.FileHeader) (*models.User, error) {
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

	// Begin transaction
	tx, err := s.userRepo.BeginTx()
	if err != nil {
		return nil, err
	}

	// đảm bảo rollback nếu có panic / error
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		}
	}()

	// Create user
	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
	}

	// 1️⃣ Create user
	if err = s.userRepo.Create(tx, user); err != nil {
		return nil, err
	}

	// 2️⃣ Assign role
	role, err := s.userRepo.GetRoleByName("student")
	if err != nil {
		return nil, err
	}
	if role == nil {
		return nil, errors.New("default role not found")
	}

	if err = s.userRepo.AssignRole(tx, user.ID, role.ID); err != nil {
		return nil, err
	}

	// 3️⃣ Create profile
	profile := &models.Profile{
		UserID:   user.ID,
		Bio:      req.Bio,
		Avatar:   "",
		Phone:    req.Phone,
		BirthDay: time.Time{},
	}
	if req.BirthDay != nil {
		profile.BirthDay = *req.BirthDay
	}
	if err = s.userRepo.CreateProfile(tx, profile); err != nil {
		return nil, err
	}

	user.Profile = profile

	// if avatarFile != nil {
	// 	avatarURL, err := s.UpdateAvatar(tx, user.ID, avatarFile)
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// 	user.Profile.Avatar = avatarURL
	// }

	// 4️⃣ Commit
	if err = tx.Commit(); err != nil {
		return nil, err
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

	// 👇 LOAD PROFILE
	profile, err := s.userRepo.GetProfileByUserID(user.ID)
	if err != nil {
		return nil, err
	}
	user.Profile = profile

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email, roles, s.jwtExpiration)
	if err != nil {
		return nil, err
	}

	resp := &models.LoginResponse{
		Token: token,
		User: models.UserInfo{
			ID:    user.ID,
			Name:  user.Name,
			Email: user.Email,
			Roles: roles,
		},
	}

	// 👇 gán profile nếu có
	if user.Profile != nil {
		resp.User.Profile = &models.Profile{
			Bio:      user.Profile.Bio,
			Phone:    user.Profile.Phone,
			BirthDay: user.Profile.BirthDay,
			Avatar:   user.Profile.Avatar,
		}
	}

	return resp, nil
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

	// Get user roles
	roles, err := s.userRepo.GetUserRoles(user.ID)
	if err != nil {
		return nil, err
	}

	// 👇 LOAD PROFILE
	profile, err := s.userRepo.GetProfileByUserID(user.ID)
	if err != nil {
		return nil, err
	}
	user.Profile = profile

	resp := &models.UserInfo{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		Roles: roles,
	}

	if user.Profile != nil {
		resp.Profile = &models.Profile{
			Bio:      user.Profile.Bio,
			Phone:    user.Profile.Phone,
			BirthDay: user.Profile.BirthDay,
			Avatar:   user.Profile.Avatar,
		}
	}

	return resp, nil

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

// GetUserName by ID
func (s *AuthService) GetUserNameByID(userID int64) (string, error) {
	return s.userRepo.GetNameByID(userID)
}

// UpdateAvatar cập nhật avatar của user
func (s *AuthService) UpdateAvatar(tx *sql.Tx, userID int64, avatarFile *multipart.FileHeader) (string, error) {
	// 1️⃣ Lấy tên user
	userName, err := s.GetUserNameByID(userID)
	if err != nil {
		return "", err
	}

	// 2️⃣ Lưu file lên server
	avatarURL, err := utils.SaveUserAvatar(userID, userName, avatarFile)
	if err != nil {
		return "", err
	}

	// 3️⃣ Update avatar path vào DB
	if err := s.userRepo.UpdateAvatar(tx, userID, avatarURL); err != nil {
		return "", err
	}

	return avatarURL, nil
}
