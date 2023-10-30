import express from "express";
import {
  getAllFailedAttempts,
  verificationCode,
  codeConfirm,
  getAllCode,
} from "../../controllers/FailedLogin/authController";

export const failedRouter = express.Router();

// Monitor system for failed logins
failedRouter.get("/failed-attempts", getAllFailedAttempts);
failedRouter.post("/generate-verification-code", verificationCode);
failedRouter.post("/code-confirm", codeConfirm);
failedRouter.get("/code-verification", getAllCode);
