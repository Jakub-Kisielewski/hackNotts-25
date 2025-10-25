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
  imageURL TEXT,
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

-- Shares
CREATE TABLE shares (
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id),
  receiver_id INT REFERENCES users(id),
  product_id INT REFERENCES products(id),
  created_at TIMESTAMP DEFAULT NOW()
);

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

