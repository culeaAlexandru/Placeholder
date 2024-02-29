const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.listen(3002, () => {
  console.log("Server is running on port 3002");
});

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "portfolio_login_db",
});
const saltRounds = 10;
app.post("/register", (req, res) => {
  const sentEmail = req.body.Email;
  const sentUsername = req.body.UserName;
  const setPassword = req.body.Password;

  // Check if the email or username already exists
  const checkExistenceSQL =
    "SELECT * FROM users WHERE email = ? OR username = ?";
  const checkExistenceValues = [sentEmail, sentUsername];

  db.query(checkExistenceSQL, checkExistenceValues, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.length > 0) {
      // User with the same email or username already exists
      res.send({ message: "Email or username is already registered" });
    } else {
      // If the email and username are not already registered, proceed with registration
      bcrypt.hash(setPassword, saltRounds, (hashErr, hash) => {
        if (hashErr) {
          res.send(hashErr);
        } else {
          const insertUserSQL =
            "INSERT INTO users (email, username, password) VALUES (?,?,?)";
          const insertUserValues = [sentEmail, sentUsername, hash];

          db.query(insertUserSQL, insertUserValues, (insertErr, results) => {
            if (insertErr) {
              res.send(insertErr);
            } else {
              console.log("User inserted successfully");
              res.send({ message: "User added!" });
            }
          });
        }
      });
    }
  });
});

app.post("/login", (req, res) => {
  const sentLoginUsername = req.body.LoginUserName;
  const setLoginPassword = req.body.LoginPassword;

  const selectUserSQL = "SELECT * FROM users WHERE username = ?";
  const selectUserValues = [sentLoginUsername];

  db.query(selectUserSQL, selectUserValues, (err, results) => {
    if (err) {
      res.status(500).send({ error: err });
    } else if (results.length > 0) {
      const hashedPassword = results[0].password;
      req.session.LoginUserName = results[0].username;
      console.log(req.session.LoginUserName);

      bcrypt.compare(setLoginPassword, hashedPassword, (compareErr, match) => {
        if (compareErr) {
          res.status(500).send({ error: compareErr });
        } else if (match) {
          res.send({
            results,
            username: results[0].username,
            isLoggedIn: true,
          });
        } else {
          res
            .status(401)
            .send({ message: "Credentials error", isLoggedIn: false });
        }
      });
    } else {
      res.status(401).send({ message: "Credentials error", isLoggedIn: false });
    }
  });
});

app.get("/", (req, res) => {
  if (req.session && req.session.LoginUserName) {
    res.send({ valid: true, username: req.session.LoginUserName });
  } else {
    res.send({ valid: false });
  }
});
