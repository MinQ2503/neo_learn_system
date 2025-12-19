package user

import (
	"errors"
	"time"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
	"github.com/MinQ2503/neo_learn_system/backend/internal/utils"
)

type CreateStudentRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password"`
	Bio      string `json:"bio"`
	Avatar   string `json:"avatar"`
	Phone    string `json:"phone"`
	BirthDay string `json:"birthday"` // Format: YYYY-MM-DD
}

type UpdateStudentRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email" binding:"omitempty,email"`
	Password string `json:"password" binding:"omitempty,min=6"`
	Status   *int8  `json:"status"`
	Bio      string `json:"bio"`
	Avatar   string `json:"avatar"`
	Phone    string `json:"phone"`
	BirthDay string `json:"birthday"` // Format: YYYY-MM-DD
}

// Aliases for other roles to use
type CreateUserRequest = CreateStudentRequest
type UpdateUserRequest = UpdateStudentRequest

type UserService struct {
	repo *UserRepository
}

func NewUserService(repo *UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) CreateStudent(req *CreateStudentRequest) error {
	exists, err := s.repo.EmailExists(req.Email)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("email already exists")
	}

	password := req.Password
	if password == "" {
		password = "Demo@1234"
	}

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return err
	}

	// Start transaction
	tx, err := s.repo.BeginTx()
	if err != nil {
		return err
	}
	// Defer rollback in case of panic or error
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
	}

	if err = s.repo.Create(tx, user); err != nil {
		return err
	}

	if err = s.repo.AssignRole(tx, user.ID, "student"); err != nil {
		return err
	}

	// Create profile if any field is provided
	if req.Bio != "" || req.Avatar != "" || req.Phone != "" || req.BirthDay != "" {
		var birthDay time.Time
		if req.BirthDay != "" {
			birthDay, err = time.Parse("2006-01-02", req.BirthDay)
			if err != nil {
				return errors.New("invalid birthday format, expected YYYY-MM-DD")
			}
		}

		profile := &models.Profile{
			UserID:   user.ID,
			Bio:      req.Bio,
			Avatar:   req.Avatar,
			Phone:    req.Phone,
			BirthDay: birthDay,
		}
		if err = s.repo.CreateProfile(tx, profile); err != nil {
			return err
		}
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

func (s *UserService) GetStudents() ([]models.User, error) {
	return s.repo.GetUsersByRole("student")
}

func (s *UserService) GetStudent(id int64) (*models.User, error) {
	isStudent, err := s.repo.HasRole(id, "student")
	if err != nil {
		return nil, err
	}
	if !isStudent {
		return nil, errors.New("user is not a student")
	}
	return s.repo.GetByID(id)
}

func (s *UserService) UpdateStudent(id int64, req *UpdateStudentRequest) error {
	user, err := s.GetStudent(id)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("student not found")
	}
	return s.updateUser(user, req)
}

func (s *UserService) DeleteStudent(id int64) error {
	isStudent, err := s.repo.HasRole(id, "student")
	if err != nil {
		return err
	}
	if !isStudent {
		return errors.New("user is not a student")
	}
	return s.repo.Delete(id)
}

// Helper methods
func (s *UserService) createUser(req *CreateUserRequest, role string) error {
	exists, err := s.repo.EmailExists(req.Email)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("email already exists")
	}

	password := req.Password
	if password == "" {
		password = "Demo@1234"
	}

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return err
	}

	// Start transaction
	tx, err := s.repo.BeginTx()
	if err != nil {
		return err
	}
	// Defer rollback in case of panic or error
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
	}

	if err = s.repo.Create(tx, user); err != nil {
		return err
	}

	if err = s.repo.AssignRole(tx, user.ID, role); err != nil {
		return err
	}

	// Always create profile
	var birthDay time.Time
	if req.BirthDay != "" {
		birthDay, err = time.Parse("2006-01-02", req.BirthDay)
		if err != nil {
			return errors.New("invalid birthday format, expected YYYY-MM-DD")
		}
	}

	profile := &models.Profile{
		UserID:   user.ID,
		Bio:      req.Bio,
		Avatar:   req.Avatar,
		Phone:    req.Phone,
		BirthDay: birthDay,
	}
	if err = s.repo.CreateProfile(tx, profile); err != nil {
		return err
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

func (s *UserService) updateUser(user *models.User, req *UpdateUserRequest) error {
	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Password != "" {
		hashed, err := utils.HashPassword(req.Password)
		if err != nil {
			return err
		}
		user.Password = hashed
	}

	if err := s.repo.Update(user); err != nil {
		return err
	}

	// Update profile
	if user.Profile == nil {
		user.Profile = &models.Profile{UserID: user.ID}
	}

	if req.Bio != "" {
		user.Profile.Bio = req.Bio
	}
	if req.Avatar != "" {
		user.Profile.Avatar = req.Avatar
	}
	if req.Phone != "" {
		user.Profile.Phone = req.Phone
	}
	if req.BirthDay != "" {
		birthDay, err := time.Parse("2006-01-02", req.BirthDay)
		if err != nil {
			return errors.New("invalid birthday format, expected YYYY-MM-DD")
		}
		user.Profile.BirthDay = birthDay
	}

	return s.repo.UpdateProfile(user.Profile)
}

// Instructor methods
func (s *UserService) CreateInstructor(req *CreateUserRequest) error {
	return s.createUser(req, "instructor")
}

func (s *UserService) GetInstructors() ([]models.User, error) {
	return s.repo.GetUsersByRole("instructor")
}

func (s *UserService) GetInstructor(id int64) (*models.User, error) {
	isInstructor, err := s.repo.HasRole(id, "instructor")
	if err != nil {
		return nil, err
	}
	if !isInstructor {
		return nil, errors.New("user is not an instructor")
	}
	return s.repo.GetByID(id)
}

func (s *UserService) UpdateInstructor(id int64, req *UpdateUserRequest) error {
	user, err := s.GetInstructor(id)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("instructor not found")
	}
	return s.updateUser(user, req)
}

func (s *UserService) DeleteInstructor(id int64) error {
	isInstructor, err := s.repo.HasRole(id, "instructor")
	if err != nil {
		return err
	}
	if !isInstructor {
		return errors.New("user is not an instructor")
	}
	return s.repo.Delete(id)
}

// Admin methods
func (s *UserService) CreateAdmin(req *CreateUserRequest) error {
	return s.createUser(req, "admin")
}

func (s *UserService) GetAdmins() ([]models.User, error) {
	return s.repo.GetUsersByRole("admin")
}

func (s *UserService) GetAdmin(id int64) (*models.User, error) {
	isAdmin, err := s.repo.HasRole(id, "admin")
	if err != nil {
		return nil, err
	}
	if !isAdmin {
		return nil, errors.New("user is not an admin")
	}
	return s.repo.GetByID(id)
}

func (s *UserService) UpdateAdmin(id int64, req *UpdateUserRequest) error {
	user, err := s.GetAdmin(id)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("admin not found")
	}
	return s.updateUser(user, req)
}

func (s *UserService) DeleteAdmin(id int64) error {
	isAdmin, err := s.repo.HasRole(id, "admin")
	if err != nil {
		return err
	}
	if !isAdmin {
		return errors.New("user is not an admin")
	}
	return s.repo.Delete(id)
}
