import { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  gender: string;
  birthday: string;
  createdAt: Date;
}

export interface QuestionsUser {
  pregunta: string;
  opcionesRespuesta: string[];
  respuestaCorrecta: string;
  nivelDificultad: string;
  categoria: string;
}