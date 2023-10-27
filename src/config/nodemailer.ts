import nodemailer from 'nodemailer';
import "dotenv/config.js";

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: `${process.env.USER_EMAIL}`,
    pass: `${process.env.PASS_EMAIL}`,
  },
});

transporter.verify().then(() => {
  console.log("Ready To Send Email ✅");
});