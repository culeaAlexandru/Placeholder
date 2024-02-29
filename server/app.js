const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
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

const uri =
  "mongodb+srv://ionutalexandruculea:nsnsbahja@placeholder.3rhmcks.mongodb.net/?retryWrites=true&w=majority&appName=Placeholder";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const saltRounds = 10;

app.listen(3002, () => {
  console.log("Server is running on port 3002");
});

async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    if (error.codeName === "AtlasError") {
      console.error("Atlas Error Details:", error.details);
    }
  }
}

connectToMongo();

app.post("/register", async (req, res) => {
  const sentEmail = req.body.Email;
  const sentUsername = req.body.UserName;
  const setPassword = req.body.Password;

  try {
    const existingUser = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({
        $or: [{ email: sentEmail }, { username: sentUsername }],
      });

    if (existingUser) {
      res.send({ message: "Email or username is already registered" });
    } else {
      const hash = await bcrypt.hash(setPassword, saltRounds);
      const newUser = {
        email: sentEmail,
        username: sentUsername,
        password: hash,
      };

      await client
        .db("portfolio_login_db")
        .collection("users")
        .insertOne(newUser);
      console.log("User inserted successfully");
      res.send({ message: "User added!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const sentLoginUsername = req.body.LoginUserName;
  const setLoginPassword = req.body.LoginPassword;

  try {
    const user = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username: sentLoginUsername });

    if (user) {
      const match = await bcrypt.compare(setLoginPassword, user.password);

      if (match) {
        req.session.LoginUserName = user.username;
        console.log(req.session.LoginUserName);

        res.send({
          results: user,
          username: user.username,
          isLoggedIn: true,
        });
      } else {
        res
          .status(401)
          .send({ message: "Credentials error", isLoggedIn: false });
      }
    } else {
      res.status(401).send({ message: "Credentials error", isLoggedIn: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  if (req.session && req.session.LoginUserName) {
    res.send({ valid: true, username: req.session.LoginUserName });
  } else {
    res.send({ valid: false });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Error logging out");
    } else {
      res.clearCookie("connect.sid");
      res.send("Logged out successfully");
    }
  });
});
