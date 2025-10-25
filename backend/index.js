import pg from "pg";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

const app = express();
const port = process.env.PORT || 3001;
/*
app.use(
  session({
    name: "Auth",
    secret: "XYZ-V",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO,
    }),
  })
);*/

dotenv.config();

console.log("Database URL:", process.env.DATABASE_URL);

const { Pool } = pg;
app.use(express.json());

// connect to Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// test route
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error("Error connecting to database:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
	res.send("main page of this thing");
});
app.post("/item", async (req, res) => {

	res.send("not allowed to add item");
});
app.get("/feed", async (req, res) => {
	res.json({ "item1": "item2" });
});

app.post("/signup", async (req, res) => {
	// store to database
	try {
		const result = await pool.query("INSERT INTO USERS(name, email, password) VALUES ('John Doe', 'doedoe@gmail.com', 'random') RETURNING *;");
        console.log('Record created:', result.rows[0]);
    } catch (err) {
        console.error('Error creating record', err.stack);
    }
});

app.post("/login", async (req, res) => {
	// return jwt
	// get from database with email in req body
	try {
		const result = await pool.query(`SELECT * FROM USERS WHERE email = '${req.body.email}';`);
		console.log('Record fetched:', result.rows[0]);

	} catch (err) {
		console.error('Error fetching record', err.stack);
	}
	res.send("logged in");
});

app.post("/like", async (req, res) => {
	CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  product_id INT REFERENCES products(id),
  created_at TIMESTAMP DEFAULT NOW()
);

	// insert like to database
	if (!req.body.user_id || !req.body.product_id) {
		return res.status(400).json({ error: "Missing user_id or product_id" });
	}
	
try {
		const result = await pool.query(
			"INSERT INTO likes (user_id, product_id) VALUES ($1, $2) RETURNING *;",
			[req.body.user_id, req.body.product_id]
		);
		console.log('Like added:', result.rows[0]);
		res.json({ success: true, like: result.rows[0] });
	}
}	

});

app.delete("/like", async (req, res) => {
	// remove like from database
	if (!req.body.user_id || !req.body.product_id) {
		return res.status(400).json({ error: "Missing user_id or product_id" });
	}
	try {
		const result = await pool.query(
			"DELETE FROM likes WHERE user_id = $1 AND product_id = $2 RETURNING *;",
			[req.body.user_id, req.body.product_id]
		);
		console.log('Like removed:', result.rows[0]);
		res.json({ success: true, like: result.rows[0] });
	} catch (err) {
		console.error('Error removing like', err.stack);
		res.status(500).json({ error: "Failed to remove like" });
	}
});

app.post("/cart", async (req, res) => {
	// add item to cart in database with quantity
	if (!req.body.user_id || !req.body.product_id || !req.body.quantity) {
		return res.status(400).json({ error: "Missing user_id, product_id, or quantity" });
	}

	try {
		const result = await pool.query(
			"INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *;",
			[req.body.user_id, req.body.product_id, req.body.quantity]
		);
		console.log('Item added to cart:', result.rows[0]);
		res.json({ success: true, cart_item: result.rows[0] });
	} catch (err) {
		console.error('Error adding item to cart', err.stack);
		res.status(500).json({ error: "Failed to add item to cart" });
	}
});

app.get("/cart", async (req, res) => {
	// get cart items for user from database
	if (!req.query.user_id) {
		return res.status(400).json({ error: "Missing user_id" });
	}

	try {
		const result = await pool.query(
			"SELECT * FROM cart WHERE user_id = $1;",
			[req.query.user_id]
		);
		console.log('Cart items fetched:', result.rows);
		res.json({ success: true, cart_items: result.rows });
	} catch (err) {
		console.error('Error fetching cart items', err.stack);
		res.status(500).json({ error: "Failed to fetch cart items" });
	}
});

app.delete("/cart", async (req, res) => {
	// remove item from cart in database
	if (!req.body.user_id || !req.body.product_id) {
		return res.status(400).json({ error: "Missing user_id or product_id" });
	}

	try {
		const result = await pool.query(
			"DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING *;",
			[req.body.user_id, req.body.product_id]
		);
		console.log('Item removed from cart:', result.rows[0]);
		res.json({ success: true, cart_item: result.rows[0] });
	} catch (err) {
		console.error('Error removing item from cart', err.stack);
		res.status(500).json({ error: "Failed to remove item from cart" });
	}
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
