import { Request, Response } from "express";
import { Questions } from "../../models/Question";
import { questions } from "../../api/question";
import { QuestionsUser } from "../../interfaces";
import { User } from "../../models/Users";
import { validationResult } from "express-validator";

const generateRandomPercentages = () => {
  const MAX_PERCENTAGE = 40;

  const percentages = [];
  let totalPercentage = 0;

  for (let i = 0; i < 3; i++) {
    const maxAllowed = MAX_PERCENTAGE - (2 - i);
    const percentage = Math.floor(Math.random() * (maxAllowed + 1));
    percentages.push(percentage);
    totalPercentage += percentage;
  }

  percentages.push(100 - totalPercentage);

  return percentages;
};

function shuffleArray(array: any) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

export const saveQuestions = async (req: Request, res: Response) => {
  const allQuestions: QuestionsUser[] = questions;
  try {
    for (const question of allQuestions) {
      const audienceHelpPercentages = generateRandomPercentages();
      const shuffledOptions = shuffleArray(question.opcionesRespuesta);

      const correctAnswerIndex = shuffledOptions.indexOf(
        question.respuestaCorrecta,
      );

      const totalPercentage = audienceHelpPercentages.reduce(
        (acc, percentage) => acc + percentage,
        0,
      );

      if (totalPercentage < 100) {
        const diff = 100 - totalPercentage;
        audienceHelpPercentages[correctAnswerIndex] += diff;

        audienceHelpPercentages[correctAnswerIndex] = Math.max(
          audienceHelpPercentages[correctAnswerIndex],
          0,
        );
      }

      const ques = new Questions({
        question: question.pregunta,
        options_answer: shuffledOptions,
        correct_answer: question.respuestaCorrecta,
        difficulty_level: question.nivelDificultad,
        categorie: question.categoria,
        audience_help: audienceHelpPercentages,
      });

      await ques.save();
    }

    return res.status(200).json("Questions loaded successfully");
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const getAllQuestions = async (req: Request, res: Response) => {
  const questions = await Questions.find();
  try {
    questions.length > 0
      ? res.status(200).json(questions)
      : res.status(404).json({ message: "No questions found" });
  } catch (error) {
    return res.status(500).json({ message: "Error: " + error });
  }
};

export const getQuestionById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const oneQuestion = await Questions.findOne({ _id: id });
  try {
    if (!id) return res.status(404).json({ message: "id is required" });
    if (!oneQuestion)
      return res.status(404).json({ message: "No questions found" });
    return res.status(200).json(oneQuestion);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

const questionsDisplayed = new Set();

export const filterQuestionsByLevel = async (req: Request, res: Response) => {
  const { level } = req.params;

  try {
    const availableQuestions = await Questions.find({
      difficulty_level: level,
    }).lean();

    if (!availableQuestions || availableQuestions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions were found for this level." });
    }

    const questionsNotDisplayed = availableQuestions.filter(
      (question) => !questionsDisplayed.has(question._id),
    );

    if (questionsNotDisplayed.length === 0) {
      questionsDisplayed.clear();
    }

    const randomQuestion =
      questionsNotDisplayed[
        Math.floor(Math.random() * questionsNotDisplayed.length)
      ];

    questionsDisplayed.add(randomQuestion._id);

    console.log(questionsDisplayed);
    return res.status(200).json(randomQuestion);
  } catch (error) {
    res.status(500).json({ message: "Error getting question." });
  }
};

export const userResponse = async (req: Request, res: Response) => {
  const { questionId } = req.params;
  const { userResponse } = req.body;

  try {
    const question = await Questions.findById(questionId);
    console.log(question);
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    const correctResponse = question.correct_answer;

    if (
      userResponse.toLowerCase().trim() === correctResponse.toLowerCase().trim()
    ) {
      res.json({ result: "Correct" });
    } else {
      res.json({ result: "Incorrect" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error processing response." });
  }
};

export const audienceHelp = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const currentQuestion = await Questions.findById(id);

    if (!currentQuestion) {
      throw new Error("Question not found");
    }

    const { options_answer, correct_answer, audience_help } = currentQuestion;
    const maxPercentage = Math.max(...audience_help);

    const filteredOptions = options_answer.filter(
      (data) => data !== correct_answer,
    );
    const filteredPercentages = audience_help.filter(
      (data) => data < maxPercentage,
    );

    const optionsWithPercentage = filteredOptions.map((name, i) => ({
      name,
      value: filteredPercentages[i],
    }));

    optionsWithPercentage.push({
      name: correct_answer,
      value: maxPercentage,
    });

    const resultPublicHelp = shuffleArray(optionsWithPercentage) 

    return res.status(200).json(resultPublicHelp);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error when using public help." });
  }
};

export const addScoreToUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { level, prize, userId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          score_history: {
            level,
            prize,
          },
        },
      },
      { new: true },
    );

    return res.status(201).json({
      message: "User score saved successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getScoreHistory = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User no found" });
    }

    const scoreHistory = user.score_history;

    res.status(200).json({ scoreHistory });
  } catch (error) {
    res.status(500).json({ error: "Error getting score history" });
  }
};

export const callToAFriend = async (req: Request, res: Response) => {
  const { questionId } = req.params;

  if (questionId === undefined)
    return res.status(404).json("QuestionId is required");

  try {
    const responseFriend = [
      "No estoy completamente seguro, pero creo que la respuesta podría ser",
      "Tengo algunas dudas, pero me inclino por la respuesta ",
      "No estoy muy seguro, pero mi elección es",
      "No hay duda al respecto, la respuesta es",
      "Es una conjetura, pero diría que la respuesta es",
      "No tengo mucha confianza en esto, pero elijo la respuesta",
      "Estoy absolutamente seguro de que la respuesta correcta es ",
      "Puedes confiar en mí, la respuesta es",
      "Estoy convencido de que la respuesta correcta es",
      "Sin lugar a dudas, la respuesta es",
    ];
    let result = Math.floor(Math.random() * responseFriend.length);
    const findQuestion = await Questions.findById(questionId);

    if (!findQuestion) return res.status(404).json("Question not found");
    return res.status(200).json({
      heAnswered: true,
      responseFriendly: `${responseFriend[result]} '${findQuestion.correct_answer}'`,
    });
  } catch (error) {
    return res.status(500).json({ error: "His friend didn't answer" });
  }
};

const getRandomOptionsToEliminate = (
  options: string[],
  count: number,
): string[] => {
  if (options.length <= count) {
    return options;
  }
  const shuffledOptions = options.sort(() => Math.random() - 0.5);
  return shuffledOptions.slice(0, count);
};

export const fiftyFiftyHelp = async (req: Request, res: Response) => {
  const { questionId } = req.params;
  try {
    const currentQuestion = await Questions.findById(questionId);

    if (!currentQuestion) {
      throw new Error("Question not found");
    }

    const { options_answer, correct_answer } = currentQuestion;

    const incorrectOptions = options_answer.filter(
      (option) => option !== correct_answer,
    );

    const optionsToEliminate = getRandomOptionsToEliminate(incorrectOptions, 2);

    // Eliminamos las respuestas seleccionadas
    const remainingOptions = options_answer.filter(
      (option) => !optionsToEliminate.includes(option),
    );

    return res.status(200).json({
      remainingOptions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error using 50-50 help." });
  }
};
