import express from "express";
import mysql from "mysql2/promise";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json({ limit: "32kb" }));
const port = Number(process.env.PORT || 3001);
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "app_user",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "identity_db",
  connectionLimit: 10
});

app.get("/health/live", (_req, res) => res.json({ status: "ok", service: "identity" }));
app.get("/health/ready", async (_req, res) => {
  try { await pool.query("SELECT 1"); res.json({ status: "ready" }); }
  catch { res.status(503).json({ status: "not_ready" }); }
});

app.post("/api/v1/auth/register", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || !email.includes("@") ||
      typeof password !== "string" || password.length < 12) {
    return res.status(400).json({ error: "Valid email and password of at least 12 characters required" });
  }
  try {
    const hash = await argon2.hash(password);
    const [result] = await pool.execute(
      "INSERT INTO users (email, password_hash, status) VALUES (?, ?, 'ACTIVE')",
      [email.toLowerCase(), hash]
    );
    // Public registration intentionally does not grant privileged roles.
    res.status(201).json({ id: result.insertId, email: email.toLowerCase(), status: "ACTIVE" });
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Email already registered" });
    console.error("registration failed", err?.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/v1/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string")
    return res.status(400).json({ error: "Email and password required" });
  try {
    const [rows] = await pool.execute(
      "SELECT id, email, password_hash, status FROM users WHERE email = ? LIMIT 1",
      [email.toLowerCase()]
    );
    const user = rows[0];
    if (!user || user.status !== "ACTIVE" || !(await argon2.verify(user.password_hash, password)))
      return res.status(401).json({ error: "Invalid credentials" });

    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) return res.status(503).json({ error: "JWT secret is not configured securely" });
    const accessToken = jwt.sign({ sub: String(user.id) }, secret, { expiresIn: "15m", issuer: "hospital-identity" });
    res.json({ access_token: accessToken, token_type: "Bearer", expires_in: 900, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("login failed", err?.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, "0.0.0.0", () => console.log(`identity service listening on ${port}`));