import { FailedLogin } from "../../models/FailledLogin";
import { Response, Request } from "express";
import { User } from "../../models/Users";
import { transporter } from "../../config/nodemailer";
import { VerificationCode } from "../../models/VerificationCode";

const generateVerificationCode = ()=> {
  return Math.floor(1000 + Math.random() * 9000);
}

const verificationCode = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const verifiedEmail = await User.findOne({ email });

    if (!verifiedEmail) return res.status(404).json("User not found");
    // Generamos un código de verificación
    const verificationCode = generateVerificationCode();
    console.log("Code", verificationCode);

    // Guardamos el codigo en la base de datos
    const saveCode = new VerificationCode({
      email: email.toLowerCase(),
      code: verificationCode,
    });
    await saveCode.save();

    const mailOptions = {
      from: "menas7527@gmail.com",
      to: email,
      subject: "Password reset verification code",
      text: `Your verification code is: ${verificationCode}`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error(error);
        return res
          .status(500)
          .json({ message: "Error sending verification code" });
      }
      res
        .status(200)
        .json({ message: "A verification code has been sent to your email" });
    });
  } catch (error) {
    return res.status(500).json(`Server error ${error}`);
  }
};

const getAllCode = async (req: Request, res: Response) => {
  const code = await VerificationCode.find();
  try {
    code.length > 0
      ? res.status(200).json(code)
      : res.status(404).json("There is no registered code");
  } catch (error) {
    console.log(error);
  }
};

const codeConfirm = async (req: Request, res: Response) => {
  const { email, codeConfirm } = req.body;


  try {
    const user = await User.findOne({ email });
    const getCodeUser = await VerificationCode.find({ email });

    if (!user) return res.status(404).json("User not found");

    if (getCodeUser.length === 0)
      return res.status(404).json("We do not have codes for verification");

    if (getCodeUser[getCodeUser.length - 1].code === codeConfirm) {
      user.activeAccount = true;
      await user.save();
    } else {
      return res.status(401).json({ message: "Incorrect verification code" });
    }

    await VerificationCode.deleteMany({ email });
    await FailedLogin.deleteMany({ userId: user._id });
    res.status(200).json({
      message:
        "Identity verification successful, proceed to reset your password",
    });
  } catch (error) {
    res.status(500).json(`Server error ${error}`);
  }
};


const getAllFailedAttempts = async (req: Request, res: Response) => {
  try {
    const user = await FailedLogin.find();
    return user.length !== 0
      ? res.status(200).json({ user })
      : res.status(404).json("No failed attempts"); 
  } catch (error) {
    res.status(500).json(`Server error ${error}`)
  }
}

export {getAllFailedAttempts, verificationCode, codeConfirm, getAllCode}