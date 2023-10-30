import express from "express";
import * as gamesController from "../../controllers/Questions/gameController";
import { addScoreValidation } from "../../middlewares/userValidations";
export const gamesRoutes = express.Router();

//Game-Routes
gamesRoutes.get("/save-questions", gamesController.saveQuestions);
gamesRoutes.get("/get-questions", gamesController.getAllQuestions);
gamesRoutes.get("/get-question/:id", gamesController.getQuestionById);
gamesRoutes.get("/questions/:level", gamesController.filterQuestionsByLevel);
gamesRoutes.get("/score-history/:userId", gamesController.getScoreHistory);
gamesRoutes.get("/call-friend/:questionId", gamesController.callToAFriend);
gamesRoutes.get("/help/50-50/:questionId", gamesController.fiftyFiftyHelp);
gamesRoutes.post("/question/answer/:questionId", gamesController.userResponse);
gamesRoutes.post("/question/public-help/:id", gamesController.publicHelp);
gamesRoutes.post(
  "/question/user/score",
  addScoreValidation(),
  gamesController.addScoreToUser,
);
