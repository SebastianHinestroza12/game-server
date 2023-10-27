import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, lowercase: true, unique: true},
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  puntuation: { type: Number, default: 0 }, 
  progress: {
    level: Number,
    current_question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }
  }, 
  activeAccount: { type: Boolean, default: true }, 
  role: { type: String, lowercase: true, enum: ['admin', 'user'], default: 'user' }
});

export const User = mongoose.model("User", userSchema);

