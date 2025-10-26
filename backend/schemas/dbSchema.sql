-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
);

-- Products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    label TEXT,
    company TEXT,
    price NUMERIC,
    websiteURL TEXT,
    imageURLS TEXT[],
    sizes TEXT[],
    tags TEXT[]
);

-- Likes
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    product_id INT REFERENCES products(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user1_id INT REFERENCES users(id),
    user2_id INT REFERENCES users(id),
    last_message_id INT,
    user_lowest INT GENERATED ALWAYS AS (LEAST(user1_id, user2_id)) STORED,
    user_highest INT GENERATED ALWAYS AS (GREATEST(user1_id, user2_id)) STORED,
    UNIQUE (user_lowest, user_highest)
);

-- Messages
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id),
    sender_id INT REFERENCES users(id),
    content TEXT,
    message_type TEXT CHECK(message_type IN ('text', 'share')),
    is_read BOOLEAN DEFAULT FALSE
);

-- Shares (uses message id as primary key, no SERIAL)
CREATE TABLE shares (
    id INT PRIMARY KEY REFERENCES messages(id),
    sender_id INT REFERENCES users(id),
    receiver_id INT REFERENCES users(id),
    product_id INT REFERENCES products(id),
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE conversations
ADD CONSTRAINT fk_conversation_last_message
FOREIGN KEY (last_message_id) REFERENCES messages(id);

-- Cart
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    product_id INT REFERENCES products(id),
    quantity INT DEFAULT 1
);

-- Receipts
CREATE TABLE receipts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    total NUMERIC,
    items JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions
CREATE TABLE sessions (
  sid varchar NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE sessions ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");

CREATE INDEX "IDX_session_expire" ON sessions ("expire");

CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE products ADD COLUMN embedding vector(384);
