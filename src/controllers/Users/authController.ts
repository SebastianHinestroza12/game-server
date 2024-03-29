import { Response, Request } from "express";
import { validationResult } from "express-validator";
import { User } from "../../models/Users";
import { FailedLogin } from "../../models/FailledLogin";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config.js";


const registerUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { userName, email, password, role, activeAccount } = req.body;

  try {
    const findUser = await User.findOne({
      $or: [{ userName: userName.toLowerCase() }, { email }],
    });
    if (findUser) {
      if (findUser.userName === userName.toLowerCase()) {
        return res.status(409).json({
          error: `The username: ${findUser.userName} is already registered`,
        });
      }
      return res.status(409).json({
        error: `The user with email: ${findUser.email} is already registered`,
      });
    } else {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const addUser = new User({
        userName,
        email,
        password: hashedPassword,
        role,
        activeAccount,
      });
      const result = await addUser.save();

      return res.status(201).json({
        createdUser: true,
        user: result,
      });
    }
  } catch (e) {
    const error = <Error>e;
    return res.status(404).json({
      createUser: false,
      error: error.message,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const ipAddress = req.ip;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ login: false, error: "Email or password was not correct" });
    }

    if (!user.activeAccount)
      return res.status(403).json({
        error:
          "The account has been blocked due to inappropriate behavior. Please contact support for more information.",
      });

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      const failedLogin = new FailedLogin({ userId: user._id, ipAddress });
      await failedLogin.save();

      const maxFailedAttempts = 3;
      const recentFailedAttempts = await FailedLogin.countDocuments({
        userId: user._id,
      });

      let response;
      if (recentFailedAttempts >= maxFailedAttempts) {
        user.activeAccount = false;
        await user.save();
        response = res.status(403).json({
          Information: "Account blocked for maximum failed attempts",
        });
      } else {
        response = res
          .status(401)
          .json({ login: false, message: "Email or password was not correct" });
      }
      return response;
    }

    const token = jwt.sign(
      { userId: user.id, userName: user.userName },
      `${process.env.JWT_SECRET_KEY}`,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, { httpOnly: true });
    await FailedLogin.deleteMany({ userId: user._id });
    return res
      .status(200)
      .json({ login: true, userName: user.userName, token });
  } catch (e) {
    const error = <Error>e;
    return res.status(500).json({ login: false, error: error.message });
  }
};

const modifyInformation = async (req: Request, res: Response) => {
  const { email, userName } = req.body;
  try {
    const updateUser = await User.findOneAndUpdate({ email }, { userName });

    if (updateUser)
      return res.status(200).json({
        updated: true,
        message: "User updated successfully",
      });
    return res.status(404).json({
      updated: false,
      message: "User not found",
    });
  } catch (error) {
    res.status(500).json(`Server error: ${error}`);
  }
};

const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Successful logout" });
};

const recoverPassword = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, newPassword } = req.body;
  const saltRounds = 10;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error(`User not found with email ${email}❌`);
    else {
      user.password = hashedNewPassword;
      await user.save();

      return res.status(200).json({
        modicado: true,
        user,
      });
    }
  } catch (e) {
    const error = <Error>e;
    return res.status(404).json({
      modified: false,
      error: error.message,
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const deletedUser = await User.findByIdAndRemove(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User No Found" });
    }
    return res
      .status(200)
      .json({ message: "Successfully Deleted User", user: deletedUser });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  const user = await User.find();
  try {
    if (user.length !== 0) return res.status(200).json(user);
    throw new Error(`We do not have registered users`);
  } catch (e) {
    let error = <Error>e;
    return res.status(404).json({
      message: error.message,
    });
  }
};

export {
  loginUser,
  registerUser,
  recoverPassword,
  getAllUsers,
  logout,
  deleteUser, 
  modifyInformation
}