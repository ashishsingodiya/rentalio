import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Listing from "../models/Listing.js";

const generateToken = (userId) => {
  const payload = userId;
  return jwt.sign(payload, process.env.JWT_SECRET);
};

export const registerUser = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });
    // const token = generateToken(user._id.toString());
    res.json({
      success: true,
      message: "Account created successfully, please login",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }
    const token = generateToken(user._id.toString());

    const safeUser = {
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({ success: true, token, user: safeUser });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getUserData = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId).select("name email role favourites -_id");
    res.json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const { userId } = req;
    const { listingId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const index = user.favourites.indexOf(listingId);

    if (index === -1) {
      const result = user.favourites.push(listingId);
      await user.save();
      res.json({ success: true, message: "Added to favorites" });
    } else {
      user.favourites.splice(index, 1);
      await user.save();
      res.json({ success: true, message: "Removed from favorites" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getUserFavouries = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const properties = await Listing.find({
      _id: { $in: user.favourites },
    });

    res.json({ success: true, properties });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
