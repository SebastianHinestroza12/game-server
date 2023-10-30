import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema({ level: Number, prize: String });

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, lowercase: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  score_history: [ScoreSchema],
  activeAccount: { type: Boolean, default: true },
  role: {
    type: String,
    lowercase: true,
    enum: ["admin", "user"],
    default: "user",
  },
});

export const User = mongoose.model("User", userSchema);

