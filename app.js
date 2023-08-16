const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sequelize, User } = require("./models");
const auth = require("./middleware/auth");
var cors = require("cors");
var app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connectDB = async () => {
  console.log("Checking database connections...");

  try {
    await sequelize.authenticate();
    console.log("Database connection stablished");
  } catch (e) {
    console.log("Database connection failed", e);
    process.exit(1);
  }
};

app.get("/", (req, res) => {
  res.json("Hello World");
});

app.post("/register", async (req, res) => {
  // Our register logic starts here
  try {
    // Get user input
    const { firstName, lastName, email, password } = req.body;

    // Validate user input
    if (!(email && password && firstName && lastName)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ where: { email: email } });
    console.log(oldUser, "OldUser");

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    const TOKEN_KEY = process.env.TOKEN_KEY || "devdf2023";
    // Create token
    const token = jwt.sign({ user_id: user._id, email }, TOKEN_KEY, {
      expiresIn: "2h",
    });
    // save user token
    user.token = token;
    await user.save();
    // return new user
    res.status(201).json({
      name: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: user.token,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: "error", message: err });
  }
  // Our register logic ends here
});

app.post("/login", async (req, res) => {
  // Our login logic starts here
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const TOKEN_KEY = process.env.TOKEN_KEY || "devdf2023";
      // Create token
      const token = jwt.sign({ user_id: user.id, email }, TOKEN_KEY, {
        expiresIn: "2h",
      });

      // save user token
      user.token = token;
      await user.save();

      // user
      res.status(200).json({
        name: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: user.token,
      });
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: "error", message: err });
  }
  // Our register logic ends here
});

app.use("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

app.use("/api/users", auth, require("./routes/users"));

(async () => {
  await connectDB();

  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
})();
