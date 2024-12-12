//! Подключение необходимых модулей
import express from "express";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from 'fs';

//! Загрузка переменных окружения из файла .env
dotenv.config();

//! Настройка путей для работы с файлами
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//! Инициализация приложения Express
const app = express();

//! Middleware для обработки входящих данных
app.use(express.json()); //! Парсинг JSON из тела запросов
app.use(express.urlencoded({ extended: true })); //! Парсинг URL-encoded данных
app.use("/css", express.static(path.join(__dirname, "css"))); //! Папка со статическими файлами CSS
app.use("/img", express.static(path.join(__dirname, "img"))); //! Папка со статическими изображениями
app.use("/js", express.static(path.join(__dirname, "js"))); //! Папка со статическими JS-файлами
app.use(cookieParser()); //! Парсинг куки
app.use(cors({ origin: "http://127.0.0.1:5501", credentials: true })); //! Настройка CORS для локального доступа

//! Подключение базы данных SQLite
const db = new sqlite3.Database(process.env.DB_PATH, (err) => {
  if (err) console.error("Ошибка при открытии базы данных:", err.message); //! Обработка ошибок подключения
  else console.log("Подключение к базе данных SQLite успешно"); //! Успешное подключение
});

//! Создание таблицы пользователей, если она не существует
db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)");

//! Middleware для проверки токена авторизации
function authenticate(req, res, next) {
  const token = req.cookies.token; //! Получение токена из куки

  if (!token) {
    return res.redirect("/login.html"); //! Если токена нет, перенаправить на страницу логина
  }

  try {
    jwt.verify(token, process.env.SECRET_KEY); //! Проверка токена
    next(); //! Если токен валиден, продолжить обработку запроса
  } catch (err) {
    console.error("Ошибка проверки токена:", err.message); //! Ошибка валидации токена
    res.redirect("/login.html"); //! Перенаправление на страницу логина
  }
}

//! Роуты для приложения
app.get("/", (req, res) => {
  const token = req.cookies.token; //! Получение токена из куки

  if (!token) {
    return res.redirect("/login.html"); //! Если токена нет, перенаправить на страницу логина
  }

  try {
    jwt.verify(token, process.env.SECRET_KEY); //! Проверка токена
    res.redirect("/index.html"); //! Перенаправление на главную страницу
  } catch (err) {
    res.redirect("/login.html"); //! Если токен невалиден, перенаправить на страницу логина
  }
});

//! Роуты для статических страниц с проверкой авторизации
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

app.get("/feedback.html", authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "feedback.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html")); //! Доступна без авторизации
});

//! Добавлен GET-маршрут для /register
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "register.html")); //! Отображение страницы регистрации
});

app.get("/skills.html", (req, res) => {
  res.sendFile(path.join(__dirname, "skills.html"));
});

//! Роут для регистрации нового пользователя
app.post("/register", async (req, res) => {
  const { username, password } = req.body; //! Получение данных из тела запроса

  const checkQuery = "SELECT * FROM users WHERE username = ?";
  db.get(checkQuery, [username], async (err, user) => {
    if (err) {
      console.error("Ошибка при запросе к базе данных:", err.message);
      return res.status(500).send({ message: "Ошибка сервера" });
    }

    if (user) {
      return res.status(400).send({ message: "Пользователь уже существует" }); //! Проверка на уникальность
    }

    const hashedPassword = await bcrypt.hash(password, 10); //! Хэширование пароля
    const insertQuery = "INSERT INTO users (username, password) VALUES (?, ?)";

    db.run(insertQuery, [username, hashedPassword], (err) => {
      if (err) {
        return res.status(500).send({ message: "Ошибка сервера" }); //! Ошибка базы данных
      }
      res.status(201).send({ message: "Успешная регистрация!" }); //! Успешная регистрация
    });
  });
});

//! Роут для входа пользователя
app.post("/login", (req, res) => {
  const { username, password, remember } = req.body; //! Получение данных из тела запроса

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

    //! Установка срока действия токена: 1 час или 30 дней
    const token = jwt.sign({ username: user.username }, process.env.SECRET_KEY, {
      expiresIn: remember ? "30d" : "1h",
    });

    res.cookie("token", token, { httpOnly: true, maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000 }); //! maxAge для 30 дней
    res.redirect("/index.html"); //! Перенаправление на главную страницу
  });
});

//! Роут для выхода пользователя
app.post("/logout", (req, res) => {
  res.clearCookie("token"); //! Удаление токена из куки
  res.redirect("/login.html"); //! Перенаправление на страницу логина
});

//! Создать папку для хранения JSON файлов, если она не существует
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

//! Роут для страницы обратной связи
app.get("/feedback", authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "feedback.html"));
});

//! Обработка маршрута для отправки отзывов
app.post('/submit_feedback', (req, res) => {
  const feedback = req.body;

  if (!feedback.name || !feedback.email || !feedback.message) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
  }

  const filePath = path.join(dataDir, 'feedback.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err && err.code !== 'ENOENT') {
          console.error('Ошибка чтения файла:', err.message);
          return res.status(500).json({ message: 'Ошибка чтения файла' });
      }

      let feedbacks = [];

      try {
          feedbacks = data ? JSON.parse(data) : [];
      } catch (parseError) {
          console.error('Ошибка парсинга JSON:', parseError.message);
          return res.status(500).json({ message: 'Ошибка парсинга JSON' });
      }

      feedbacks.push(feedback);

      fs.writeFile(filePath, JSON.stringify(feedbacks, null, 2), (writeErr) => {
          if (writeErr) {
              console.error('Ошибка записи файла:', writeErr.message);
              return res.status(500).json({ message: 'Ошибка записи файла' });
          }
          res.status(200).json({ message: 'Отзыв сохранен' });
      });
  });
});

//! Настройка порта для сервера
const PORT = process.env.PORT || 3000;

//! Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`); //! Сообщение о запуске
});