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
    origin: true,
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

// Middleware to protect endpoints requiring auth
function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: "Authentication required" });
    }
    next();
}

app.get("/", async (req, res) => {
    res.send("API For FitR");
});

app.get("/feed", async (req, res) => {
    try {
        const products = await pool.query("SELECT * FROM products ORDER BY RANDOM() LIMIT 50;");
        console.log(`Fetched ${products.rows.length} products`);
        res.json({ success: true, items: products.rows });
    } catch (err) {
        console.error("Error fetching products", err.stack);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

app.post("/signup", async (req, res) => {
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
        req.session.user = { id: user.id, email: user.email };
        res.json({ success: true, user });
    } catch (err) {
        console.error("Error creating user", err.stack);
        res.status(500).json({ error: "Failed to create user" });
    }
});

app.post("/login", async (req, res) => {
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

// Get all users (for finding people to chat with)
app.get("/users", requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email FROM users WHERE id != $1;",
            [req.session.user.id]
        );
        res.json({ success: true, users: result.rows });
    } catch (err) {
        console.error("Error fetching users", err.stack);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Get or create conversation between two users
app.post("/conversations", requireAuth, async (req, res) => {
    const { other_user_id } = req.body;
    const current_user_id = req.session.user.id;
    
    console.log("POST /conversations - Raw other_user_id:", other_user_id, "Type:", typeof other_user_id);
    console.log("POST /conversations - current_user_id:", current_user_id, "Type:", typeof current_user_id);
    
    if (!other_user_id) {
        return res.status(400).json({ error: "Missing other_user_id" });
    }
    
    // Convert to integer to ensure type safety
    const otherUserId = parseInt(other_user_id, 10);
    
    console.log("POST /conversations - Parsed otherUserId:", otherUserId, "Type:", typeof otherUserId);
    
    if (isNaN(otherUserId)) {
        return res.status(400).json({ error: "Invalid other_user_id" });
    }
    
    try {
        // Check if conversation already exists
        console.log("Checking for existing conversation between", current_user_id, "and", otherUserId);
        const existing = await pool.query(
            `SELECT * FROM conversations 
             WHERE user_lowest = LEAST($1::integer, $2::integer) 
             AND user_highest = GREATEST($1::integer, $2::integer);`,
            [current_user_id, otherUserId]
        );
        
        if (existing.rows.length > 0) {
            console.log("Found existing conversation:", existing.rows[0].id);
            return res.json({ success: true, conversation: existing.rows[0] });
        }
        
        // Create new conversation
        console.log("Creating new conversation");
        const result = await pool.query(
            `INSERT INTO conversations (user1_id, user2_id) 
             VALUES ($1, $2) RETURNING *;`,
            [current_user_id, otherUserId]
        );
        
        console.log("Created new conversation:", result.rows[0].id);
        res.json({ success: true, conversation: result.rows[0] });
    } catch (err) {
        console.error("Error with conversation", err);
        res.status(500).json({ error: "Failed to handle conversation" });
    }
});

// Get all conversations for current user
app.get("/conversations", requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.*, 
                    u1.name as user1_name, 
                    u2.name as user2_name,
                    m.content as last_message_content,
                    m.message_type as last_message_type,
                    m.sender_id as last_message_sender_id
             FROM conversations c
             LEFT JOIN users u1 ON c.user1_id = u1.id
             LEFT JOIN users u2 ON c.user2_id = u2.id
             LEFT JOIN messages m ON c.last_message_id = m.id
             WHERE c.user1_id = $1 OR c.user2_id = $1
             ORDER BY COALESCE(m.id, 0) DESC;`,
            [req.session.user.id]
        );
        res.json({ success: true, conversations: result.rows });
    } catch (err) {
        console.error("Error fetching conversations", err.stack);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
});

// Get messages for a conversation
app.get("/conversations/:id/messages", requireAuth, async (req, res) => {
    const { id } = req.params;
    
    try {
        // Verify user is part of conversation
        const convCheck = await pool.query(
            `SELECT * FROM conversations 
             WHERE id = $1 AND (user1_id = $2 OR user2_id = $2);`,
            [id, req.session.user.id]
        );
        
        if (convCheck.rows.length === 0) {
            return res.status(403).json({ error: "Not authorized" });
        }
        
        // Get messages with product details if it's a share
        const result = await pool.query(
            `SELECT m.*, 
                    p.id as product_id,
                    p.label as product_label,
                    p.company as product_company,
                    p.price as product_price,
                    p.websiteurl as product_websiteurl,
                    p.imageurls as product_imageurls,
                    p.sizes as product_sizes,
                    p.tags as product_tags,
                    s.product_id as share_product_id
             FROM messages m
             LEFT JOIN shares s ON m.id = s.id AND m.message_type = 'share'
             LEFT JOIN products p ON s.product_id = p.id
             WHERE m.conversation_id = $1
             ORDER BY m.id ASC;`,
            [id]
        );
        
        res.json({ success: true, messages: result.rows });
    } catch (err) {
        console.error("Error fetching messages", err.stack);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

// Send a text message
app.post("/messages", requireAuth, async (req, res) => {
    const { conversation_id, content } = req.body;
    const sender_id = req.session.user.id;
    
    if (!conversation_id || !content) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    try {
        // Verify user is part of conversation
        const convCheck = await pool.query(
            `SELECT * FROM conversations 
             WHERE id = $1 AND (user1_id = $2 OR user2_id = $2);`,
            [conversation_id, sender_id]
        );
        
        if (convCheck.rows.length === 0) {
            return res.status(403).json({ error: "Not authorized" });
        }
        
        // Insert message
        const result = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, content, message_type)
             VALUES ($1, $2, $3, 'text') RETURNING *;`,
            [conversation_id, sender_id, content]
        );
        
        // Update conversation's last_message_id
        await pool.query(
            `UPDATE conversations SET last_message_id = $1 WHERE id = $2;`,
            [result.rows[0].id, conversation_id]
        );
        
        res.json({ success: true, message: result.rows[0] });
    } catch (err) {
        console.error("Error sending message", err.stack);
        res.status(500).json({ error: "Failed to send message" });
    }
});

// Share a product
app.post("/share", requireAuth, async (req, res) => {
    const { conversation_id, product_id } = req.body;
    const sender_id = req.session.user.id;
    
    console.log("POST /share - conversation_id:", conversation_id, "product_id:", product_id, "sender_id:", sender_id);
    
    if (!conversation_id || !product_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    try {
        // Verify user is part of conversation
        const convCheck = await pool.query(
            `SELECT * FROM conversations 
             WHERE id = $1 AND (user1_id = $2 OR user2_id = $2);`,
            [conversation_id, sender_id]
        );
        
        if (convCheck.rows.length === 0) {
            return res.status(403).json({ error: "Not authorized" });
        }
        
        // Get receiver_id
        const conversation = convCheck.rows[0];
        const receiver_id = conversation.user1_id === sender_id 
            ? conversation.user2_id 
            : conversation.user1_id;
        
        console.log("Share - receiver_id:", receiver_id);
        
        // Get product details
        const productResult = await pool.query(
            `SELECT label FROM products WHERE id = $1;`,
            [product_id]
        );
        
        if (productResult.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        const productLabel = productResult.rows[0].label;
        
        // Insert message as share type
        const messageResult = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, content, message_type)
             VALUES ($1, $2, $3, 'share') RETURNING *;`,
            [conversation_id, sender_id, `Shared: ${productLabel}`]
        );
        
        const message_id = messageResult.rows[0].id;
        
        console.log("Created message with id:", message_id);
        
        // Insert into shares table
        await pool.query(
            `INSERT INTO shares (id, sender_id, receiver_id, product_id)
             VALUES ($1, $2, $3, $4);`,
            [message_id, sender_id, receiver_id, product_id]
        );
        
        console.log("Created share record");
        
        // Update conversation's last_message_id
        await pool.query(
            `UPDATE conversations SET last_message_id = $1 WHERE id = $2;`,
            [message_id, conversation_id]
        );
        
        console.log("Updated conversation last_message_id");
        
        res.json({ success: true, message: messageResult.rows[0] });
    } catch (err) {
        console.error("Error sharing product", err.stack);
        res.status(500).json({ error: "Failed to share product" });
    }
});

// Likes endpoints
app.post("/like", requireAuth, async (req, res) => {
    if (!req.body.product_id) {
        return res.status(400).json({ error: "Missing product_id" });
    }
    try {
        const result = await pool.query(
            "INSERT INTO likes (user_id, product_id) VALUES ($1, $2) RETURNING *;",
            [req.session.user.id, req.body.product_id]
        );
        res.json({ success: true, like: result.rows[0] });
    } catch (err) {
        console.error("Error adding like", err.stack);
        res.status(500).json({ error: "Failed to add like" });
    }
});

app.delete("/like", requireAuth, async (req, res) => {
    if (!req.body.product_id) {
        return res.status(400).json({ error: "Missing product_id" });
    }
    try {
        const result = await pool.query(
            "DELETE FROM likes WHERE user_id = $1 AND product_id = $2 RETURNING *;",
            [req.session.user.id, req.body.product_id]
        );
        if (!result.rows.length) {
            return res.status(404).json({ error: "Like not found" });
        }
        res.json({ success: true, like: result.rows[0] });
    } catch (err) {
        console.error("Error removing like", err.stack);
        res.status(500).json({ error: "Failed to remove like" });
    }
});

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});