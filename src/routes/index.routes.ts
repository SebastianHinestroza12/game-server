import express from "express";
import {
  registerUser,
  loginUser,
  recoverPassword,
  getAllUsers,
  modifyInformation,
  logout,
  deleteUser,
} from "../controllers/Users/authController";
import { authenticateToken } from "../middlewares/protectedRoutes";
import {
  usersValidation,
  loginValidations,
  recoverPasswordValidations,
} from "../middlewares/userValidations";

export const router = express.Router();

//Users
router.get("/users", getAllUsers);
router.post("/register", usersValidation(), registerUser);
router.post("/login", loginValidations(), loginUser);
router.post("/logout", logout);
router.put("/recover-password", recoverPasswordValidations(), recoverPassword);
router.put("/update-user", modifyInformation);
router.delete("/delete/:userId", deleteUser);

// Protected Routed
router.get("/protected-route", authenticateToken, (req, res) => {
  return res.status(200).json({ message: "Successful authentication" });
});




