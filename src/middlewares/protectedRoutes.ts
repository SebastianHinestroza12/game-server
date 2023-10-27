import jwt from "jsonwebtoken";
import "dotenv/config.js";
import { Response, Request, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const secretKey = `${process.env.JWT_SECRET_KEY}`; 

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const {token } = req.cookies

  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  jwt.verify(token, secretKey, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    
    req.user = user;
    next();
  });
};
