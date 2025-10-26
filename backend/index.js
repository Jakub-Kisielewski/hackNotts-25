import pg from "pg";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

console.log("Database URL:", process.env.DATABASE_URL);

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const PgSession = connectPgSimple(session);

app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// trust proxy if behind a reverse proxy (set in env when needed)
if (process.env.TRUST_PROXY === "1") {
    app.set("trust proxy", 1);
}

app.use(
    session({
        store: new PgSession({
            pool: pool,
            tableName: "sessions",
        }),
        name: process.env.SESSION_NAME || "sid",
        secret: process.env.SESSION_SECRET || "dev-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        },
    })
);

app.get("/", async (req, res) => {
    res.send("API For FitR");
});

app.post("/item", async (req, res) => {
    try {
        // Add a item to database
        const { name, description, price, image, category, brand, quantity } = req.body;
        const result = await pool.query(
            "INSERT INTO items(name, description, price, image, category, brand, quantity) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;",
            [name, description, price, image, category, brand, quantity]
        );
        console.log("Item added:", result.rows[0]);
        res.json({ success: true, item: result.rows[0] });
    } catch (err) {
        console.error("Error adding item", err.stack);
        res.status(500).json({ error: "Failed to add item" });
    }
});

app.get("/feed", requireAuth, async (req, res) => {
    try {
        // Get all items and pick 50 randomly
        const items = await pool.query("SELECT * FROM items ORDER BY RANDOM() LIMIT 50;");
        res.json({ success: true, items: items.rows });
    } catch (err) {
        console.error("Error fetching items", err.stack);
        res.status(500).json({ error: "Failed to fetch items" });
    }
});

app.post("/signup", async (req, res) => {
    // expecting { name, email, password }
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing name, email or password" });
    }
    try {
        const result = await pool.query(
            "INSERT INTO users(name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email;",
            [name, email, password]
        );
        const user = result.rows[0];
        // set session
        req.session.user = { id: user.id, email: user.email };
        res.json({ success: true, user });
    } catch (err) {
        console.error("Error creating user", err.stack);
        res.status(500).json({ error: "Failed to create user" });
    }
});

app.post("/login", async (req, res) => {
    // expecting { email, password }
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
    }
    try {
        const result = await pool.query("SELECT id, name, email, password FROM users WHERE email = $1;", [email]);
        const user = result.rows[0];
        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        req.session.user = { id: user.id, email: user.email };
        res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        console.error("Error fetching user", err.stack);
        res.status(500).json({ error: "Login failed" });
    }
});

// Middleware to protect endpoints requiring auth
function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
    }
    next();
}

app.post("/like", requireAuth, async (req, res) => {
    if (!req.body.user_id || !req.body.product_id) {
        return res.status(400).json({ error: "Missing user_id or product_id" });
    }
    try {
        const result = await pool.query(
            "INSERT INTO likes (user_id, product_id) VALUES ($1, $2) RETURNING *;",
            [req.body.user_id, req.body.product_id]
        );
        console.log("Like added:", result.rows[0]);
        res.json({ success: true, like: result.rows[0] });
    } catch (err) {
        console.error("Error adding like", err.stack);
        res.status(500).json({ error: "Failed to add like" });
    }
});

app.delete("/like", requireAuth, async (req, res) => {
    if (!req.body.user_id || !req.body.product_id) {
        return res.status(400).json({ error: "Missing user_id or product_id" });
    }
    try {
        const result = await pool.query(
            "DELETE FROM likes WHERE user_id = $1 AND product_id = $2 RETURNING *;",
            [req.body.user_id, req.body.product_id]
        );
        console.log("Like removed:", result.rows[0]);
        // if no rows are returned, the like was not found
        if (!result.rows.length) {
            return res.status(404).json({ error: "Like not found" });
        } else {
            return res.json({ success: true, like: result.rows[0] });
        }
    } catch (err) {
        console.error("Error removing like", err.stack);
        res.status(500).json({ error: "Failed to remove like" });
    }
});

app.post("/cart", requireAuth, async (req, res) => {
    if (!req.body.user_id || !req.body.product_id || !req.body.quantity) {
        return res.status(400).json({ error: "Missing user_id, product_id, or quantity" });
    }
    try {
        const result = await pool.query(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *;",
            [req.body.user_id, req.body.product_id, req.body.quantity]
        );
        console.log("Item added to cart:", result.rows[0]);
        res.json({ success: true, cart_item: result.rows[0] });
    } catch (err) {
        console.error("Error adding item to cart", err.stack);
        res.status(500).json({ error: "Failed to add item to cart" });
    }
});

app.get("/cart", requireAuth, async (req, res) => {
    if (!req.query.user_id) {
        return res.status(400).json({ error: "Missing user_id" });
    }
    try {
        const result = await pool.query("SELECT * FROM cart WHERE user_id = $1;", [req.query.user_id]);
        console.log("Cart items fetched:", result.rows);
        res.json({ success: true, cart_items: result.rows });
    } catch (err) {
        console.error("Error fetching cart items", err.stack);
        res.status(500).json({ error: "Failed to fetch cart items" });
    }
});

app.delete("/cart", requireAuth, async (req, res) => {
    if (!req.body.user_id || !req.body.product_id) {
        return res.status(400).json({ error: "Missing user_id or product_id" });
    }
    try {
        const result = await pool.query(
            "DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING *;",
            [req.body.user_id, req.body.product_id]
        );
        console.log("Item removed from cart:", result.rows[0]);
        res.json({ success: true, cart_item: result.rows[0] });
    } catch (err) {
        console.error("Error removing item from cart", err.stack);
        res.status(500).json({ error: "Failed to remove item from cart" });
    }
});

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
