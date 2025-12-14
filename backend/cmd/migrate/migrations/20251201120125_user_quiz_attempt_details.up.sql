CREATE TABLE user_quiz_attempt_details (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    answer_id BIGINT NULL,
    is_correct TINYINT DEFAULT 0,

    CONSTRAINT fk_uqad_attempt FOREIGN KEY (attempt_id) REFERENCES user_quiz_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_uqad_question FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);
