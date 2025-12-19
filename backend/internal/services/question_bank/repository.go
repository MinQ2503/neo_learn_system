package question_bank

import (
	"database/sql"

	"github.com/MinQ2503/neo_learn_system/backend/internal/models"
)

type DBTX interface {
	Exec(query string, args ...interface{}) (sql.Result, error)
	Query(query string, args ...interface{}) (*sql.Rows, error)
	QueryRow(query string, args ...interface{}) *sql.Row
}

type QuestionRepository struct {
	db *sql.DB
}

func NewQuestionRepository(db *sql.DB) *QuestionRepository {
	return &QuestionRepository{db: db}
}

func (r *QuestionRepository) BeginTx() (*sql.Tx, error) {
	return r.db.Begin()
}

func (r *QuestionRepository) CreateQuestion(tx *sql.Tx, question *models.QuizQuestion) error {
	var db DBTX = r.db
	if tx != nil {
		db = tx
	}
	query := `
		INSERT INTO quiz_questions (question, created_at, updated_at)
		VALUES (?, NOW(), NOW())
	`
	result, err := db.Exec(query, question.Question)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	question.ID = id
	return nil
}

func (r *QuestionRepository) CreateAnswer(tx *sql.Tx, answer *models.QuizQuestionAnswer) error {
	var db DBTX = r.db
	if tx != nil {
		db = tx
	}
	query := `
		INSERT INTO quiz_question_answers (quiz_question_id, answer, is_correct, point, created_at, updated_at)
		VALUES (?, ?, ?, ?, NOW(), NOW())
	`
	result, err := db.Exec(query, answer.QuizQuestionID, answer.Answer, answer.IsCorrect, answer.Point)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	answer.ID = id
	return nil
}

func (r *QuestionRepository) GetQuestionByID(id int64) (*models.QuizQuestion, error) {
	query := `SELECT id, quiz_id, question, created_at, updated_at FROM quiz_questions WHERE id = ?`
	row := r.db.QueryRow(query, id)

	var q models.QuizQuestion
	err := row.Scan(&q.ID, &q.QuizID, &q.Question, &q.CreatedAt, &q.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &q, nil
}

func (r *QuestionRepository) GetAllQuestions() ([]models.QuizQuestion, error) {
	query := `SELECT id, quiz_id, question, created_at, updated_at FROM quiz_questions`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var questions []models.QuizQuestion
	for rows.Next() {
		var q models.QuizQuestion
		err := rows.Scan(&q.ID, &q.QuizID, &q.Question, &q.CreatedAt, &q.UpdatedAt)
		if err != nil {
			return nil, err
		}
		questions = append(questions, q)
	}
	return questions, nil
}

func (r *QuestionRepository) GetAnswersByQuestionID(questionID int64) ([]models.QuizQuestionAnswer, error) {
	query := `SELECT id, quiz_question_id, answer, is_correct, point, created_at, updated_at FROM quiz_question_answers WHERE quiz_question_id = ?`
	rows, err := r.db.Query(query, questionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var answers []models.QuizQuestionAnswer
	for rows.Next() {
		var a models.QuizQuestionAnswer
		err := rows.Scan(&a.ID, &a.QuizQuestionID, &a.Answer, &a.IsCorrect, &a.Point, &a.CreatedAt, &a.UpdatedAt)
		if err != nil {
			return nil, err
		}
		answers = append(answers, a)
	}
	return answers, nil
}

func (r *QuestionRepository) UpdateQuestion(tx *sql.Tx, question *models.QuizQuestion) error {
	var db DBTX = r.db
	if tx != nil {
		db = tx
	}
	query := `UPDATE quiz_questions SET question = ?, updated_at = NOW() WHERE id = ?`
	_, err := db.Exec(query, question.Question, question.ID)
	return err
}

func (r *QuestionRepository) DeleteQuestion(tx *sql.Tx, id int64) error {
	var db DBTX = r.db
	if tx != nil {
		db = tx
	}
	// Delete answers first
	_, err := db.Exec(`DELETE FROM quiz_question_answers WHERE quiz_question_id = ?`, id)
	if err != nil {
		return err
	}

	query := `DELETE FROM quiz_questions WHERE id = ?`
	_, err = db.Exec(query, id)
	return err
}

func (r *QuestionRepository) DeleteAnswersByQuestionID(tx *sql.Tx, questionID int64) error {
	var db DBTX = r.db
	if tx != nil {
		db = tx
	}
	query := `DELETE FROM quiz_question_answers WHERE quiz_question_id = ?`
	_, err := db.Exec(query, questionID)
	return err
}
