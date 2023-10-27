import express from "express";
import { registerUser, loginUser, recoverPassword, getAllUsers ,modifyInformation, logout, deleteUser} from '../controllers/Users/authController'
import { usersValidation, loginValidations , recoverPasswordValidations} from '../middlewares/userValidations'
import { authenticateToken } from '../middlewares/protectedRoutes'
import { getAllFailedAttempts, verificationCode, codeConfirm, getAllCode } from "../controllers/FailedLogin/authController";
import * as gamesController from '../controllers/Questions/gameController'
const router = express.Router();

//Users
router.get('/users',getAllUsers)
router.post('/register', usersValidation(), registerUser)
router.post('/login', loginValidations(), loginUser)
router.post('/logout', logout)
router.put('/recover-password', recoverPasswordValidations(), recoverPassword)
router.put('/update-user', modifyInformation)
router.delete('/delete/:userId',deleteUser)

// Protected Routed
router.get("/ruta-protegida", authenticateToken, (req, res) => {
  // La solicitud solo llegará aquí si el token es válido
  res.json({ message: "Acceso al recurso protegido permitido" });
});

// Monitor system for failed logins
router.get("/failed-attempts", getAllFailedAttempts);
router.post("/generate-verification-code", verificationCode);
router.post("/code-confirm", codeConfirm);
router.get("/code-verification", getAllCode);

//Game-Routes
router.get("/save-questions", gamesController.saveQuestions);
router.get("/get-questions", gamesController.getAllQuestions);
router.get("/get-question/:id", gamesController.getQuestionById);
router.get("/questions/:level", gamesController.filterQuestionsByLevel);
router.post("/question/answer/:questionId", gamesController.userResponse);
router.post("/question/public-help/:id", gamesController.publicHelp);



export { router };
