import pkg from "pg";
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

const { Pool } = pkg;
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// end of test

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
});

app.post("/login", async (req, res) => {
	// return jwt
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
