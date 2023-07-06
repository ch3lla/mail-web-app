const User = require("../models/User");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// rendering pages
exports.homepage = (req, res) => {
  res.render("index");
};

exports.registerPage = (req, res) => {
  res.render("register");
};

exports.loginPage = (req, res) => {
  res.render("login");
};

exports.emailPage = (req, res) => {
  res.render("email");
};

let user; // global variable

exports.registerUser = async (req, res) => {
  try {
    const { email, password, password_confirm } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.render("register", {
        message: "User with email already exists",
      });
    } else if (password !== password_confirm) {
      return res.render("register", {
        message: "Passwords do not match!",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    try {
      user = await User.create({ email, password: hashedPassword });
    } catch (error) {
      console.error("Unable to save user:", error);
      return res.status(500).send({ message: "User registration failed" });
    }

    // create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "2h" }
    );
    user.token = token; //saves token

    console.log("User successfully saved");
    res.redirect("/email");
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).send({ message: "User registration failed" });
  }
  console.log("User: ", user);
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.render("login", {
        message: "User not found",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.render("login", {
        message: "Invalid Password!",
      });
    }
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "2h" }
    );
    user.token = token;
    res.redirect("/email");
    console.log("User successfully logged in");
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).send({ message: "Login failed" });
  }
  console.log("User: ", user);
};

exports.sendEmail = async (req, res) => {
  try {
    const { receiver, subject, message } = req.body;
    // Get the email of the registered user
    const updateUser = await User.update(
      { receiver: receiver },
      { where: { email: user.email } }
    );
    if (!updateUser) {
      console.log("Update failed");
    } else {
      console.log("Update successfull");
    }
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: user.email,
        password: user.password,
      },
    });

    // Verify the SMTP connection
    transporter.verify((error, success) => {
      if (error) {
        console.log("There was an error verifying your connection: ", error);
      } else {
        console.log("Server is ready to take your messages: ", success);
      }
    });

    let mailOptions = {
      from: user.email,
      to: receiver,
      subject: subject,
      text: message,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("There was an error sending the mail: " + err);
      } else {
        res.send("Email sent successfully!");
        console.log("Email sent successfully!");
        console.log("Message ID:", info.messageId);
        console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
      }
    });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).send({ message: "Email failed to send" });
  }
};

exports.logoutUser = (req, res) => {
  req.logout();
  res.redirect("/login");
};
