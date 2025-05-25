
CREATE TABLE IF NOT EXISTS emails (
  id SERIAL PRIMARY KEY,
  thread_id TEXT,
  message_id TEXT UNIQUE,
  sender TEXT,
  recipients TEXT,
  cc TEXT,
  bcc TEXT,
  subject TEXT,
  body TEXT,
  date TIMESTAMP,
  snippet TEXT,
  drive_links TEXT[]
);

CREATE INDEX IF NOT EXISTS idx_message_id ON emails(message_id);
