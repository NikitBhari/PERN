import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import pool from "../config/db.js";

const router = express.Router();

/* SIGNUP */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);
  
  const user = await pool.query(
    "INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING id,name,email",
    [name, email, hash]
  );

  res.json(user.rows[0]);
});

/* LOGIN */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  console.log("Login attempt:", { email, password }); // Debug

  const user = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  console.log("User found:", user.rows); // Debug

  if (!user.rows.length) {
    console.log("No user found with email:", email); // Debug
    return res.status(401).json("Invalid credentials");
  }

  console.log("Comparing passwords..."); // Debug
  const valid = await bcrypt.compare(password, user.rows[0].password);
  console.log("Password valid:", valid); // Debug
  
  if (!valid) return res.status(401).json("Invalid credentials");
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  const token = jwt.sign(
    { id: user.rows[0].id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  console.log("Generated token:", token);

  res.cookie("token", token, {
  httpOnly: true,              // JS can't access cookie
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "strict",          // CSRF protection
  maxAge: 60 * 60 * 1000       // 1 hour
});

console.log("Cookie set");

// ❌ Do NOT send token in JSON when using cookies
res.json({ message: "Login successful" });
  console.log("Login successful");
});
export default router;
