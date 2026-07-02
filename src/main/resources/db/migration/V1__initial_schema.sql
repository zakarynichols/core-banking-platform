CREATE TABLE greetings (
    id BIGSERIAL PRIMARY KEY,
    message VARCHAR(255) NOT NULL
);

INSERT INTO greetings (message) VALUES ('Hello, world!');
