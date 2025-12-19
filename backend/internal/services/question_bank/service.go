package question_bank

import (
	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type QuestionService struct {
	repo *QuestionRepository
}

func NewQuestionService(repo *QuestionRepository) *QuestionService {
	return &QuestionService{repo: repo}
}

func (s *QuestionService) CreateQuestion(question *models.QuizQuestion) (*models.QuizQuestion, error) {
	tx, err := s.repo.BeginTx()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	if err := s.repo.CreateQuestion(tx, question); err != nil {
		return nil, err
	}

	for i := range question.Answers {
		question.Answers[i].QuizQuestionID = question.ID
		if err := s.repo.CreateAnswer(tx, &question.Answers[i]); err != nil {
			return nil, err
		}
	}

	return question, tx.Commit()
}

func (s *QuestionService) GetQuestion(id int64) (*models.QuizQuestion, error) {
	question, err := s.repo.GetQuestionByID(id)
	if err != nil {
		return nil, err
	}

	answers, err := s.repo.GetAnswersByQuestionID(id)
	if err != nil {
		return nil, err
	}
	question.Answers = answers

	return question, nil
}

func (s *QuestionService) GetAllQuestions() ([]models.QuizQuestion, error) {
	return s.repo.GetAllQuestions()
}

func (s *QuestionService) UpdateQuestion(question *models.QuizQuestion) error {
	tx, err := s.repo.BeginTx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if err := s.repo.UpdateQuestion(tx, question); err != nil {
		return err
	}

	// Replace answers: delete old ones, insert new ones
	if err := s.repo.DeleteAnswersByQuestionID(tx, question.ID); err != nil {
		return err
	}

	for i := range question.Answers {
		question.Answers[i].QuizQuestionID = question.ID
		if err := s.repo.CreateAnswer(tx, &question.Answers[i]); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (s *QuestionService) DeleteQuestion(id int64) error {
	tx, err := s.repo.BeginTx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if err := s.repo.DeleteQuestion(tx, id); err != nil {
		return err
	}

	return tx.Commit()
}

func (s *QuestionService) DeleteQuestions(ids []int64) error {
	tx, err := s.repo.BeginTx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, id := range ids {
		if err := s.repo.DeleteQuestion(tx, id); err != nil {
			return err
		}
	}

	return tx.Commit()
}
