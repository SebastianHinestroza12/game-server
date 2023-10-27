import mongoose from "mongoose";

const verificationCodeSchema = new mongoose.Schema({
  email: { type: String, required: true, ref: "User" },
  code: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const VerificationCode = mongoose.model(
  "VerificationCode",
  verificationCodeSchema,
);

