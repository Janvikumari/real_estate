import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    console.log(newUser);

    // Send success response
    return res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  const { name, password } = req.body;

  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { name },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    // Generate the token
    const token = jwt.sign(
      {
        id: user.id,
        isAdmin:true, 
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '20d' } // 20 days in seconds
    );

    // Set the token as a cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 20, // 20 days in milliseconds
    });

    // Send a successful response
    const { password: userPassword, ...userInfo } = user;
    return res.status(200).json({ message: "Login successful!", user: userInfo });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({ message: "Failed to login!" });
  }
};

export const logout = (req, res) => {
  // Clear the token cookie
  res.clearCookie("token").status(200).json({ message: "Logout successful!" });
};
