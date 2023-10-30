import { body, ValidationChain } from "express-validator";

export const usersValidation = (): ValidationChain[] => {
  return [
    body("userName")
      .trim()
      .notEmpty()
      .withMessage("userName is required")
      .isString()
      .withMessage("Numbers are not accepted, only letters")
      .isLength({ min: 3, max: 20 })
      .withMessage(
        "It must contain a minimum of 3 characters and a maximum of 20",
      ),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isString()
      .withMessage("Must be a string")
      .isEmail()
      .withMessage("It must be in email format, example: example@example.com")
      .normalizeEmail(),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])/)
      .withMessage(
        "Password must contain at least 1 number, 1 special character and 1 uppercase letter",
      ),
  ];
};

export const loginValidations = (): ValidationChain[] => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isString()
      .withMessage("Must be a string")
      .isEmail()
      .withMessage("It must be in email format, example: example@example.com")
      .normalizeEmail(),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ];
};

export const recoverPasswordValidations = (): ValidationChain[] => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isString()
      .withMessage("Must be a string")
      .isEmail()
      .withMessage("It must be in email format, example: example@example.com")
      .normalizeEmail(),

    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("newPassword is required4")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])/)
      .withMessage(
        "Password must contain at least 1 number, 1 special character and 1 uppercase letter",
      ),
  ];
};
export const addScoreValidation = (): ValidationChain[] => {
  return [
    body("level")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isNumeric()
      .withMessage("Must be a number"),

    body("prize")
      .trim()
      .notEmpty()
      .withMessage("prize is required")
      .isString()
      .withMessage("Must be a string"),

    body("userId").notEmpty().withMessage("userId is required"),
  ];
};
