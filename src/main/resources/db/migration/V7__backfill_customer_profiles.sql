-- Backfill Customer profiles for existing users who don't have one
DO $$
DECLARE
  u RECORD;
  new_customer_id BIGINT;
BEGIN
  FOR u IN SELECT id, full_name, email FROM users WHERE customer_id IS NULL LOOP
    INSERT INTO customers (full_name, email, phone, address, status, created_at, updated_at)
    VALUES (u.full_name, u.email, NULL, NULL, 'ACTIVE', NOW(), NOW())
    RETURNING id INTO new_customer_id;

    UPDATE users SET customer_id = new_customer_id WHERE id = u.id;
  END LOOP;
END $$;

-- Now make customer_id NOT NULL
ALTER TABLE users ALTER COLUMN customer_id SET NOT NULL;
