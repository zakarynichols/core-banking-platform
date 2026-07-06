CREATE TABLE account_holders (
    account_id  BIGINT       NOT NULL REFERENCES accounts(id),
    customer_id BIGINT       NOT NULL REFERENCES customers(id),
    added_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    PRIMARY KEY (account_id, customer_id)
);

-- Backfill: make the existing primary owner a holder too
INSERT INTO account_holders (account_id, customer_id, added_at)
SELECT id, customer_id, created_at FROM accounts
ON CONFLICT DO NOTHING;
