CREATE TABLE quiz_question_answers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_id BIGINT NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct TINYINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);
