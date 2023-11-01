import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema({
  question: { type: String, required: true, maxlength: 500 },
  options_answer: {
    type: [String],
    required: true,
    validate: {
      validator: function (value: string) {
        return value.length >= 2 && value.length <= 6;
      },
      message: "Debe haber entre 2 y 6 opciones de respuesta.",
    },
  },
  correct_answer: { type: String, required: true },
  difficulty_level: {
    type: String,
    enum: ["Easy", "Intermediate", "Difficult"],
    required: true,
  },
  categorie: { type: String, required: true },
  audience_help: {
    type: [Number],
    required: true,
    validate: {
      validator: function (value: any): boolean {
        return (
          Array.isArray(value) &&
          value.length === 4 &&
          value.reduce((acc: number, val: number) => acc + val, 0) === 100
        );
      },
      message:
        "The audience_help field must contain 4 numbers that add up to 100.",
    },
  },
});

export const Questions = mongoose.model("Questions", questionsSchema);

