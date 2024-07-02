const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Middleware setup
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

// MongoDB connection setup
const uri =
  "mongodb+srv://ionutalexandruculea:nsnsbahja@placeholder.3rhmcks.mongodb.net/?retryWrites=true&w=majority&appName=Placeholder";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Number of salt rounds for bcrypt hashing
const saltRounds = 10;

// Cloudinary configuration
cloudinary.config({
  cloud_name: "slaponia",
  api_key: "863639221347982",
  api_secret: "EUxMNrqgNg4IQkw1GJL8OPRkoOU",
});

// Configuration for Multer and Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const username = req.body.UserName;
    const extension = file.mimetype.split("/")[1];
    return {
      folder: `photos/${username}`,
      format: extension,
      public_id: file.originalname.split(".")[0],
    };
  },
});

const upload = multer({ storage: storage });

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
app.post("/register", upload.single("CIPhoto"), async (req, res) => {
  const sentEmail = req.body.Email;
  const sentUsername = req.body.UserName;
  const sentPassword = req.body.Password;
  const sentFirstName = req.body.FirstName;
  const sentLastName = req.body.LastName;
  const sentPronoun = req.body.Pronoun;
  const sentCountry = req.body.Country;
  const sentAdress = req.body.Adress;
  const sentPhoneNumber = req.body.PhoneNumber;
  const setCIPhoto = req.file.path;

  try {
    // Function to check if email or username already exists
    const existingUser = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({
        $or: [{ email: sentEmail }, { username: sentUsername }],
      });

    if (existingUser) {
      res.send({ message: "Email or username is already registered" });
    } else {
      // Function to generate verification token and send verification email
      const verificationToken = jwt.sign(
        { email: sentEmail },
        "your_verification_secret",
        { expiresIn: "1d" }
      );
      sendVerificationEmail(sentEmail, verificationToken);

      // Function to hash the password before saving
      const hash = await bcrypt.hash(sentPassword, saltRounds);
      const newUser = {
        email: sentEmail,
        username: sentUsername,
        password: hash,
        firstName: sentFirstName,
        lastName: sentLastName,
        pronoun: sentPronoun,
        country: sentCountry,
        adress: sentAdress,
        phoneNumber: sentPhoneNumber,
        CIPhoto: setCIPhoto,
        emailVerified: false,
        adminVerified: "Waiting",
        admin: false,
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

  // Function to send the verification email
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
      .updateOne({ email: email }, { $set: { emailVerified: true } }, (err) => {
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

app.get("/admin/verify-requests", async (req, res) => {
  try {
    const users = await client
      .db("portfolio_login_db")
      .collection("users")
      .find({ adminVerified: "Waiting", emailVerified: true })
      .toArray();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const deleteFolder = async (folderPath) => {
  try {
    // Delete all resources in the folder
    await cloudinary.api.delete_resources_by_prefix(folderPath);
    console.log(`Resources in folder ${folderPath} deleted from Cloudinary`);

    // Delete the folder itself
    await cloudinary.api.delete_folder(folderPath);
    console.log(`Folder ${folderPath} deleted from Cloudinary`);
  } catch (error) {
    console.error("Error deleting folder from Cloudinary:", error);
  }
};

app.post("/admin/update-verify-status", async (req, res) => {
  const { email, status } = req.body;

  try {
    const user = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.CIPhoto) {
      const username = user.username;
      const folderPath = `photos/${username}`;
      await deleteFolder(folderPath);
    }

    const result = await client
      .db("portfolio_login_db")
      .collection("users")
      .updateOne({ email }, { $set: { adminVerified: status, CIPhoto: null } });

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "Status updated successfully" });
    } else {
      res.status(500).json({ message: "Failed to update status" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    if (user) {
      // Check if the user has verified their email
      if (!user.emailVerified) {
        return res.send({ message: "Email not verified", isLoggedIn: false });
      }

      // Check if the user has been rejected by the admin
      if (user.adminVerified === "Rejected") {
        return res.send({
          message: "Admin approval rejected",
          isLoggedIn: false,
        });
      }

      // Check if the user is approved by the admin
      if (user.adminVerified !== "Accepted") {
        return res.send({
          message: "Admin approval pending",
          isLoggedIn: false,
        });
      }

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
          isVerified: user.emailVerified,
          isAdminApproved: user.adminVerified === "Accepted",
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

// Endpoint to check if user is logged in
app.get("/", async (req, res) => {
  if (req.session && req.session.LoginUserName) {
    try {
      const user = await client
        .db("portfolio_login_db")
        .collection("users")
        .findOne({ username: req.session.LoginUserName });

      if (user) {
        res.send({
          valid: true,
          username: user.username,
          admin: user.admin,
          CIPhoto: user.CIPhoto,
        });
      } else {
        res.send({ valid: false });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
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

  try {
    const userData = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username: username });
    if (!userData) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Prepare the portfolio data to be saved
    const data = {
      asset1Name: savedData.asset1Name,
      asset1Percent: savedData.asset1Percent,
      asset2Name: savedData.asset2Name,
      asset2Percent: savedData.asset2Percent,
      expectedReturn: savedData.expectedReturn,
      risk: savedData.risk,
      bestOutcome: savedData.bestOutcome,
      dateCreated: new Date(savedData.dateCreated),
      dateUpdated: new Date(savedData.dateUpdated),
      startDate: savedData.startDate,
      endDate: savedData.endDate,
      interval: savedData.interval,
    };

    // Function to conditionally add asset3 and asset4 if they exist
    if (savedData.asset3Name && savedData.asset3Percent) {
      data.asset3Name = savedData.asset3Name;
      data.asset3Percent = savedData.asset3Percent;
    }

    if (savedData.asset4Name && savedData.asset4Percent) {
      data.asset4Name = savedData.asset4Name;
      data.asset4Percent = savedData.asset4Percent;
    }

    console.log("Data being saved to database:", data);

    const updateResult = await client
      .db("portfolio_login_db")
      .collection("users")
      .updateOne({ username: username }, { $push: { Portfolios: data } });

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

// Endpoint for deleting a portfolio
app.post("/delete-portfolio", async (req, res) => {
  const { username, portfolioIndex } = req.body;

  try {
    // Find the user in the database
    const user = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username: username });

    if (!user || !user.Portfolios || user.Portfolios.length <= portfolioIndex) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    // Remove the portfolio at the specified index
    const updatedPortfolios = user.Portfolios.filter(
      (_, i) => i !== portfolioIndex
    );

    // Update the user's portfolios in the database
    await client
      .db("portfolio_login_db")
      .collection("users")
      .updateOne(
        { username: username },
        { $set: { Portfolios: updatedPortfolios } }
      );

    console.log(`Portfolio at index ${portfolioIndex} deleted successfully`);
    res.status(200).json({ message: "Portfolio deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route for deleting a saved asset from a user's account
app.post("/delete-saved-asset", async (req, res) => {
  const { username, assetSymbol } = req.body;

  try {
    // Find the user in the database
    const user = await client
      .db("portfolio_login_db")
      .collection("users")
      .findOne({ username: username });

    // Check if the asset is saved for the user
    if (user && user.savedAssets && user.savedAssets.includes(assetSymbol)) {
      // Update the user's saved assets
      await client
        .db("portfolio_login_db")
        .collection("users")
        .updateOne(
          { username: username },
          { $pull: { savedAssets: assetSymbol } }
        );

      console.log("Asset deleted successfully");
      res.sendStatus(200);
    } else {
      res.status(404).json({ message: "Asset not found in saved assets." });
    }
  } catch (error) {
    console.error("Error deleting asset:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Route for saving profile data to a user's account
app.post("/save-data-profile", async (req, res) => {
  const {
    username,
    userData: { firstName, lastName, country, pronoun },
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
            lastName: lastName,
            country: country,
            pronoun: pronoun,
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
