import express from "express";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use(cookieParser());
app.use(cors({ origin: "http://127.0.0.1:5501", credentials: true }));

const db = new sqlite3.Database(process.env.DB_PATH, (err) => {
  if (err) console.error("Ошибка при открытии базы данных:", err.message);
  else console.log("Подключение к базе данных SQLite успешно");
});

db.run(
  "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)"
);

function authenticate(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login.html");
  }

  try {
    jwt.verify(token, process.env.SECRET_KEY);
    next();
  } catch (err) {
    console.error("Ошибка проверки токена:", err.message);
    res.redirect("/login.html");
  }
}

app.get("/", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login.html");
  }

  try {
    jwt.verify(token, process.env.SECRET_KEY);
    res.redirect("/index.html");
  } catch (err) {
    res.redirect("/login.html");
  }
});

app.get("/index.html", authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/history.html", authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "history.html"));
});

app.get("/gallery.html", authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "gallery.html"));
});

app.get("/features.html", authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "features.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/register.html", (req, res) => {
  res.sendFile(path.join(__dirname, "register.html"));
});

app.get("/skills.html", (req, res) => {
  res.sendFile(path.join(__dirname, "skills.html"));
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const checkQuery = "SELECT * FROM users WHERE username = ?";
  db.get(checkQuery, [username], async (err, user) => {
    if (user) {
      return res.status(400).send({ message: "Пользователь уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = "INSERT INTO users (username, password) VALUES (?, ?)";

    db.run(insertQuery, [username, hashedPassword], (err) => {
      if (err) {
        return res.status(500).send({ message: "Ошибка сервера" });
      }
      res.status(201).send({ message: "Успешная регистрация!" });
    });
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ?";
  db.get(query, [username], async (err, user) => {
    if (err) {
      console.error("Ошибка при запросе к базе данных:", err.message);
      return res.status(500).send("Ошибка сервера");
    }

    if (!user) {
      return res.status(400).send("Неверное имя пользователя или пароль");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send("Неверное имя пользователя или пароль");
    }

    const token = jwt.sign({ username: user.username }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true });
    res.redirect("/index.html");
  });
});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login.html");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
