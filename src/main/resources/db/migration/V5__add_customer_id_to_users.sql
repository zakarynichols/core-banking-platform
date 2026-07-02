ALTER TABLE users ADD COLUMN customer_id BIGINT REFERENCES customers(id);
CREATE INDEX idx_users_customer_id ON users(customer_id);
