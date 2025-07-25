const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userModel = require('../models/userModel');

const register = async (req, res) => {
  const { firstname, lastname, username, password, role } = req.body;
  try {
    const existing = await userModel.findUserByUsername(username);
    if (existing) return res.status(400).json({ msg: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.createUser(firstname, lastname, username, hashed, role);
    res.status(201).json({ msg: "User created", user });
  } catch (err) {
    res.status(500).json({ msg: "Error registering user", error: err.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await userModel.findUserByUsername(username);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ msg: "Invalid password" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ msg: "Login successful", token, user });
  } catch (err) {
    console.error('Login error:', err);
  res.status(500).json({ msg: "Login failed", error: err.message });
  }
};

module.exports = { register, login };
