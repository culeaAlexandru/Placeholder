const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET", "PUT"],
    credentials: true,
  })
);
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
  const sentPassword = req.body.Password;

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
      const hash = await bcrypt.hash(sentPassword, saltRounds);
      const newUser = {
        email: sentEmail,
        username: sentUsername,
        password: hash,
        riskA: 0,
        riskB: 0,
        createdAt: new Date(),
      };

      await client
        .db("portfolio_login_db")
        .collection("users")
        .insertOne(newUser);

      console.log("User inserted successfully");
      res.send({ message: "User added!", userId: newUser.insertedId });
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
        res.send({ message: "Credentials error", isLoggedIn: false });
      }
    } else {
      res.send({ message: "Credentials error", isLoggedIn: false });
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

app.post("/save-risk", async (req, res) => {
  const { username, riskValueA, riskValueB } = req.body;

  try {
    await client
      .db("portfolio_login_db")
      .collection("users")
      .updateOne(
        { username: username },
        { $set: { riskA: parseInt(riskValueA), riskB: parseInt(riskValueB) } }
      );

    console.log("Risk value updated successfully");
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/get-risk", async (req, res) => {
  const { username } = req.body;

  try {
    const user = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username: username });

    if (user) {
      console.log("Risk value fetched successfully:", user.riskA, user.riskB);
      res.status(200).json({ riskA: user.riskA, riskB: user.riskB });
    } else {
      console.error("User not found");
      res.sendStatus(404);
    }
  } catch (error) {
    console.error("Error fetching risk value:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/save-asset", async (req, res) => {
  const { username, assetSymbol } = req.body;

  try {
    const user = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username: username });

    if (user && user.savedAssets && user.savedAssets.includes(assetSymbol)) {
      res.status(400).json({ message: "Asset is already saved." });
    } else {
      await client
        .db("portfolio_login_db")
        .collection("users")
        .updateOne(
          { username: username },
          { $push: { savedAssets: assetSymbol } }
        );

      console.log("Asset saved successfully");
      res.sendStatus(200);
    }
  } catch (error) {
    console.error("Error saving asset:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/saved-assets/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username: username });

    if (user && user.savedAssets) {
      res.status(200).json({ savedAssets: user.savedAssets });
    } else {
      res.status(404).json({ message: "User not found or no saved assets." });
    }
  } catch (error) {
    console.error("Error fetching saved assets:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/save-data-portfolio", async (req, res) => {
  const { username, savedData } = req.body;
  const subArraySize = 3;

  try {
    const userData = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username: username });

    if (!userData) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (userData.Portfolios && userData.Portfolios.length >= subArraySize) {
      console.log("Maximum sub-array size reached");
      res.sendStatus(204);
      return;
    }

    const remainingSlots =
      subArraySize - (userData.Portfolios ? userData.Portfolios.length : 0);
    const dataToPush = savedData.slice(0, remainingSlots);

    const updateResult = await client
      .db("portfolio_login_db")
      .collection("users")
      .updateOne(
        { username: username },
        {
          $push: {
            Portfolios: { $each: dataToPush },
          },
        }
      );

    if (updateResult.modifiedCount > 0) {
      console.log("Portfolio data updated successfully");
      res.sendStatus(200);
    } else {
      console.log("Portfolio data creation skipped");
      res.sendStatus(204);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/get-portfolio-data", async (req, res) => {
  const { username } = req.body;

  try {
    const user = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username: username });

    if (user && user.Portfolios) {
      console.log("Portfolio data fetched successfully");
      res.status(200).json({ portfolioData: user.Portfolios });
    }
  } catch (error) {
    console.error("Error fetching portfolio data:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/save-data-profile", async (req, res) => {
  const {
    username,
    userData: { firstName, secondName, country, currency, pronun },
  } = req.body;

  try {
    const result = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOneAndUpdate(
        { username: username },
        {
          $setOnInsert: {
            username: username,
          },
          $set: {
            firstName: firstName,
            secondName: secondName,
            country: country,
            currency: currency,
            pronun: pronun,
          },
        },
        { upsert: true }
      );

    console.log("Profile updated/created for", username);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/get-profile-data", async (req, res) => {
  const { username } = req.body;
  console.log(username);

  try {
    const user = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username: username });

    if (user) {
      console.log("User data fetched successfully:", user);
      res.status(200).json(user);
    } else {
      console.error("User not found");
      res.sendStatus(404);
    }
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    res.status(500).json({ error: error.message });
  }
});
