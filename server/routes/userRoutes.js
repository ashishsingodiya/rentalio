import express from "express";
import { getUserData, getUserFavouries, loginUser, registerUser, toggleFavorite } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", registerUser)
userRouter.post("/login", loginUser)
userRouter.get("/data", protect, getUserData)
userRouter.post("/toggle-favorite", protect, toggleFavorite)
userRouter.get("/favourites", protect, getUserFavouries)

export default userRouter