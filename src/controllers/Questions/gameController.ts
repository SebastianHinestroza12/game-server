import { Request, Response, NextFunction } from "express";
import { Questions } from "../../models/Question";
import { questions } from "../../api/question";
import { QuestionsUser } from "../../interfaces";

export const saveQuestions = async (req: Request, res: Response) => {
  const allQuestions: QuestionsUser[] = questions;
  try {
    for (const question of allQuestions) {
      const ques = new Questions({
        question: question.pregunta,
        options_answer: question.opcionesRespuesta,
        correct_answer: question.respuestaCorrecta,
        difficulty_level: question.nivelDificultad,
        categorie: question.categoria,
      });
      await ques.save();
    }

    return res.status(200).json("Questions load successfully");
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

// Variables para realizar un seguimiento de las preguntas mostradas
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
    // Filtramos las preguntas que no han sido mostradas
    const questionsNotDisplayed = availableQuestions.filter(
      (question) => !questionsDisplayed.has(question._id),
    );

    if (questionsNotDisplayed.length === 0) {
      // Si todas las preguntas se han mostrado, reiniciamos el registro
      questionsDisplayed.clear();
    }

    // Obténemos una pregunta aleatoria de las no mostradas
    const randomQuestion =
      questionsNotDisplayed[
        Math.floor(Math.random() * questionsNotDisplayed.length)
      ];

    // Agregamos la pregunta al registro de preguntas mostradas
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
    console.error(error);
    res.status(500).json({ message: "Error processing response." });
  }
};

function asignarPorcentajes(
  string1: string,
  string2: string,
  string3: string,
  string4: string,
  correctAnswer: string,
) {
  const porcentaje1 = Math.floor(Math.random() * 70 + 1); 
  
  const porcentaje2 = Math.floor(Math.random() * (100 - porcentaje1) + 1); 

  const porcentaje3 = Math.floor(
    Math.random() * (100 - porcentaje1 - porcentaje2) + 1,
  ); 

  const porcentaje4 = 100 - porcentaje1 - porcentaje2 - porcentaje3;

  const opciones = [string1, string2, string3, string4];
  if (opciones.includes(correctAnswer)) {
    const indexRespuestaCorrecta = opciones.indexOf(correctAnswer);
    const porcentajeCorrecto = 100 - (porcentaje1 + porcentaje2 + porcentaje3);
    opciones[indexRespuestaCorrecta] = porcentajeCorrecto.toString();
  }

  const resultado = {
    [string1]: porcentaje1,
    [string2]: porcentaje2,
    [string3]: porcentaje3,
    [string4]: porcentaje4,
  };

  return resultado;
}

export const publicHelp = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Obtenemos la pregunta actual
    const currentQuestion = await Questions.findById(id);

    if (!currentQuestion) {
      throw new Error("Question not found");
    }

    const { options_answer, correct_answer } = currentQuestion;
    
    return res.status(200).json({
      responses: asignarPorcentajes(options_answer[0], options_answer[1], options_answer[2], options_answer[3], correct_answer)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error when using public help." });
  }
};


