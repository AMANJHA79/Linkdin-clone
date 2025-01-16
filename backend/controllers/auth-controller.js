const User = require("../models/user-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// sendCommentNotificationEmail,
// sendConnectionAcceptedEmail,

const {
  sendWelcomeEmail
} = require("../emails/email-handlers");

const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !password || !email) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt-linkdin", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ message: "User created successfully" });

    const profileUrl = process.env.CLIENT_URL + "/profile/" + user.username;

    try {
      await sendWelcomeEmail(user.email, user.name, profileUrl);
    } catch (emailError) {
      console.error("Error sending welcome Email", emailError);
    }
    } catch (error) {
      console.log("Error in signup: ", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
};

const login = async (req, res) => {
  try{
    const { username, password } = req.body;
    if(!username || !password){
      return res.status(400).json({ error: "All fields are required" });
    }

    //check existing user

    const user = await User.findOne({ username: username });
    if(!user){
      return res.status(400).json({ error: "Invalid credentials" });
    }

    //check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect){
      return res.status(400).json({ error: "Invalid credentials" });
    }

    //generate token
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    )

    res.cookie("jwt-linkdin", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Login successful" });
  


  }
  catch(error){
    console.log("Error in login: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }














  
};

const logout = async (req, res) => {
  try {
    res.clearCookie("jwt-linkdin");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out" });
  }
};

const getCurrentUser = async (req, res) => {
  try{
    res.json({
      success: true,
      message: "User fetched successfully",
      user: req.user,
    });

  }
  catch(error){
    console.log("Error in getCurrentUser: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser
};
