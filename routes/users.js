const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const { User } = require("../models");

router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "firstName", "lastName", "email"],
    });

    return res.json(users);
  } catch (e) {
    console.log(e);
    return res.json([]);
  }
});

router.get("/add", (req, res) => {
  const data = {
    firstName: "Dario",
    lastName: "Fuentes",
    email: "darifuentes@gmail.com",
  };

  User.create({ ...data })
    .then((usr) => res.json(usr))
    .catch((err) => console.log("Error creando usuario", err));
});

router.put("/update", async (req, res) => {
  try {
    // Get user input
    const { firstName, lastName, email, password } = req.body;

    // Validate user input
    if (!(email && password && firstName && lastName)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const existUser = await User.findOne({ where: { email: email } });
    console.log(existUser, "existUser");

    if (!existUser) {
      return res.status(409).send("User Doesn't Exist. Please Verify");
    }

    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Update user in our database
    existUser.firstName = firstName;
    existUser.lastName = lastName;
    existUser.email = email.toLowerCase();
    existUser.password = encryptedPassword;
    await existUser.save();
    // return new user
    res.status(200).json({
      status: "success",
      data: {
        firstName: existUser.firstName,
        lastName: existUser.lastName,
        email: existUser.email,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      error: err,
    });
    console.log(err);
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    // Get user input
    const { id } = req.params;

    // check if user already exist
    // Validate if user exist in our database
    const existUser = await User.findOne({ where: { id: id } });
    console.log(existUser, "existUser");

    if (!existUser) {
      return res.status(409).send("User Doesn't Exist. Please Verify");
    }
    await existUser.destroy();
    // return new user
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      error: err,
    });
    console.log(err);
  }
});

module.exports = router;
