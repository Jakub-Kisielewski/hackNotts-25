require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
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
