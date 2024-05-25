const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const PortfolioAllocation = require("portfolio-allocation");

// Middleware setup
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET", "PUT"],
    credentials: true, // Allow sending cookies
  })
);
app.use(
  session({
    secret: "secret", // Secret used to sign the session ID cookie
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7, // Session duration: 7 days
    },
  })
);

// MongoDB connection setup
const uri =
  "mongodb+srv://ionutalexandruculea:nsnsbahja@placeholder.3rhmcks.mongodb.net/?retryWrites=true&w=majority&appName=Placeholder";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Number of salt rounds for bcrypt hashing
const saltRounds = 10;

// Start the server
app.listen(3002, () => {
  console.log("Server is running on port 3002");
});

// Connect to MongoDB
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

// Endpoint for user registration
app.post("/register", async (req, res) => {
  const sentEmail = req.body.Email;
  const sentUsername = req.body.UserName;
  const sentPassword = req.body.Password;

  try {
    // Check if email or username already exists
    const existingUser = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({
        $or: [{ email: sentEmail }, { username: sentUsername }],
      });

    if (existingUser) {
      res.send({ message: "Email or username is already registered" });
    } else {
      // Generate verification token and send verification email
      const verificationToken = jwt.sign(
        { email: sentEmail },
        "your_verification_secret",
        { expiresIn: "1d" }
      );
      sendVerificationEmail(sentEmail, verificationToken);

      // Hash the password before saving
      const hash = await bcrypt.hash(sentPassword, saltRounds);
      const newUser = {
        email: sentEmail,
        username: sentUsername,
        password: hash,
        verified: false,
        riskA: 0,
        riskB: 0,
        createdAt: new Date(),
      };

      // Insert new user into the database
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

// Function to send verification email
function sendVerificationEmail(email, token) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    service: "gmail",
    auth: {
      user: "nsnsbahja@gmail.com",
      pass: "zvrk wgna cdnn mgdg",
    },
  });

  const mailOptions = {
    from: "nsnsbahja@gmail.com",
    to: email,
    subject: "Email Verification",
    html: `<p>Click <a href="http://localhost:3000/verify/${token}">here</a> to verify your email address.</p>`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending verification email:", error);
    } else {
      console.log("Verification email sent:", info.response);
    }
  });
}

// Endpoint for verifying email
app.get("/verify/:token", (req, res) => {
  const token = req.params.token;

  try {
    // Verify the token
    const decoded = jwt.verify(token, "your_verification_secret");
    const email = decoded.email;

    // Update user's verification status
    client
      .db("portfolio_login_db")
      .collection("users")
      .updateOne({ email: email }, { $set: { verified: true } }, (err) => {
        if (err) {
          res.status(500).json({ message: "Error verifying email" });
        } else {
          res.redirect("/verified");
        }
      });
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
});

// Endpoint for user login
app.post("/login", async (req, res) => {
  const sentLoginUsername = req.body.LoginUserName;
  const setLoginPassword = req.body.LoginPassword;

  try {
    // Find user by username
    const user = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username: sentLoginUsername });

    if (user && user.verified) {
      // Compare passwords
      const match = await bcrypt.compare(setLoginPassword, user.password);

      if (match) {
        // Set session variable
        req.session.LoginUserName = user.username;
        console.log(req.session.LoginUserName);

        // Send response
        res.send({
          results: user,
          username: user.username,
          isLoggedIn: true,
          isVerified: user.verified,
        });
      } else {
        res.send({ message: "Credentials error", isLoggedIn: false });
      }
    } else {
      res.send({ message: "User not verified", isLoggedIn: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to check if user is logged in
app.get("/", (req, res) => {
  if (req.session && req.session.LoginUserName) {
    res.send({ valid: true, username: req.session.LoginUserName });
  } else {
    res.send({ valid: false });
  }
});

// Endpoint for user logout
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

// Endpoint to save user's risk values
app.post("/save-risk", async (req, res) => {
  const { username, riskValueA, riskValueB } = req.body;

  try {
    // Update user's risk values
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

// Endpoint to get user's risk values
app.post("/get-risk", async (req, res) => {
  const { username } = req.body;

  try {
    // Find user by username and send risk values
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

// Route for saving an asset to a user's account
app.post("/save-asset", async (req, res) => {
  const { username, assetSymbol } = req.body;

  try {
    // Find the user in the database
    const user = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username: username });

    // Check if the asset is already saved for the user
    if (user && user.savedAssets && user.savedAssets.includes(assetSymbol)) {
      res.status(400).json({ message: "Asset is already saved." });
    } else {
      // Update the user's saved assets
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

// Route for fetching saved assets for a user
app.get("/saved-assets/:username", async (req, res) => {
  const { username } = req.params;

  try {
    // Find the user in the database
    const user = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username: username });

    // Check if the user exists and has saved assets
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

// Route for saving portfolio data to a user's account
app.post("/save-data-portfolio", async (req, res) => {
  const { username, savedData } = req.body;
  const subArraySize = 3; // Maximum sub-array size

  try {
    // Retrieve user data from the database
    const userData = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username: username });

    // If user does not exist, return error
    if (!userData) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check if maximum sub-array size for portfolios is reached
    if (userData.Portfolios && userData.Portfolios.length >= subArraySize) {
      console.log("Maximum sub-array size reached");
      res.sendStatus(204);
      return;
    }

    // Calculate remaining slots for portfolio data
    const remainingSlots =
      subArraySize - (userData.Portfolios ? userData.Portfolios.length : 0);
    const dataToPush = savedData.slice(0, remainingSlots);

    // Update the user's portfolio data
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

    // Check if portfolio data was updated successfully
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

// Route for fetching portfolio data for a user
app.post("/get-portfolio-data", async (req, res) => {
  const { username } = req.body;

  try {
    // Find the user in the database
    const user = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username: username });

    // If user exists and has portfolio data, return it
    if (user && user.Portfolios) {
      console.log("Portfolio data fetched successfully");
      res.status(200).json({ portfolioData: user.Portfolios });
    }
  } catch (error) {
    console.error("Error fetching portfolio data:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Route for saving profile data to a user's account
app.post("/save-data-profile", async (req, res) => {
  const {
    username,
    userData: { firstName, secondName, country, currency, pronun },
  } = req.body;

  try {
    // Update or create user profile in the database
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

// Route for fetching profile data for a user
app.post("/get-profile-data", async (req, res) => {
  const { username } = req.body;

  try {
    // Find the user in the database
    const user = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username: username });

    // If user exists, return their data
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

// Route for changing user password
app.post("/change-password", async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    // Find the user in the database
    const user = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username });

    // If user does not exist, return error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password in the database
    await client
      .db("portfolio_login_db")
      .collection("users")
      .updateOne({ username }, { $set: { password: hashedPassword } });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
