const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { OTP } = require("../models/OTP");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

async function userSignupController(req, res) {
  try {
    if (!req.body.email) {
      return res.status(400).json("Please Provide a valid email");
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json("User Already Exist");
    }
    user = new User({
      name: req.body.name,
      email: req.body.email,
      gender: req.body.gender,
      image: req.body.image,
      password: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      github: req.body.github,
      linkedin: req.body.linkedin,
    });
    await user.save();
    const d1 = new Date();
    d1.setMinutes(d1.getMinutes());
    const d2 = new Date();
    d2.setMinutes(d2.getMinutes() + 5);
    let otp = Math.floor(1000 + Math.random() * 9000);
    let otpObj = new OTP({
      code: bcrypt.hashSync(String(otp), 10),
      email: req.body.email,
      createdAt: Number(d1),
      expiresAt: Number(d2),
    });
    await otpObj.save();
    const data = {
      name: user.name,
      email: user.email,
      otp: otp,
    };
    const filePath = path.join(
      __dirname,
      "..",
      "public",
      "mail-template",
      "index2.ejs"
    );
    const fileContent = fs.readFileSync(filePath, "utf8");
    const modifiedEmailTemplate = ejs.render(fileContent, data);
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "Gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
    let message = {
      from: "Training Center",
      to: user.email,
      subject: "Greeting!",
      html: modifiedEmailTemplate,
    };
    await transporter.sendMail(message).catch((err) => {
      throw err;
    });
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    const userWithoutPassword = { ...user };
    delete userWithoutPassword._doc.password;
    return res
      .status(201)
      .json({ user: userWithoutPassword._doc, token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}


async function resendOTP(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "user not found.." });
    }
    await OTP.deleteMany({ email: user.email });
    let otp = Math.floor(1000 + Math.random() * 9000);
    const d = new Date();
    d.setMinutes(d.getMinutes());
    const d2 = new Date();
    d2.setMinutes(d2.getMinutes() + 1);

    let OTP_Obj = new OTP({
      code: await bcrypt.hash(String(otp), 10),
      email: user.email,
      createdAt: Number(d),
      expiresAt: Number(d2),
    });
    await OTP_Obj.save();

    const data = {
      name: user.name,
      email: user.email,
      otp: otp,
    };
    const filePath = path.join(
      __dirname,
      "..",
      "public",
      "mail-template",
      "index2.ejs"
    );
    const fileContent = fs.readFileSync(filePath, "utf8");
    const modifiedEmailTemplate = ejs.render(fileContent, data);
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "Gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
    let message = {
      from: "Training Center",
      to: user.email,
      subject: "Greeting!",
      html: modifiedEmailTemplate,
    };
    await transporter.sendMail(message).catch((err) => {
      throw err;
    });
    res.status(201).json({ msg: "code sent.." });
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function verifyUser(req, res) {
  try {
    if (!req.body.otp) {
      return res.status(401).json("Must provide otp..");
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }
    if (user.verified) {
      return res.status(400).json({ msg: "User already verified." });
    }
    const otp = await OTP.findOne({ email: user.email });
    if (!otp) {
      return res.status(404).json({ msg: "No OTP was sent." });
    }
    if (!(await bcrypt.compare(req.body.otp, otp.code))) {
      return res.status(401).json({ msg: "Wrong code." });
    }
    let d = new Date();
    if (Number(d) > Number(otp.expiresAt)) {
      return res.status(400).json({ msg: "OTP has expired." });
    }
    user.verified = true;
    await user.save();
    await OTP.deleteMany({ email: user.email });
    return res.status(200).json({ msg: "User verified successfully." });
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function loginController(req, res) {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json("Invalid Credentials");
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json("User not found..");
    }
    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
      return res.status(404).json("Wrong Email or Password");
    }
    if (!user.verified) {
      return res.status(401).json("Account is not verified");
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    await OTP.deleteMany({ email: user.email });
    let otp = Math.floor(1000 + Math.random() * 9000);
    const d = new Date();
    d.setMinutes(d.getMinutes());
    const d2 = new Date();
    d2.setMinutes(d2.getMinutes() + 1);

    let OTP_Obj = new OTP({
      code: await bcrypt.hash(String(otp), 10),
      email: user.email,
      createdAt: Number(d),
      expiresAt: Number(d2),
    });
    await OTP_Obj.save();

    const data = {
      name: user.name,
      email: user.email,
      otp: otp,
    };
    const filePath = path.join(
      __dirname,
      "..",
      "public",
      "mail-template",
      "index2.ejs"
    );
    const fileContent = fs.readFileSync(filePath, "utf8");
    const modifiedEmailTemplate = ejs.render(fileContent, data);
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "Gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
    let message = {
      from: "Training Center",
      to: user.email,
      subject: "Greeting!",
      html: modifiedEmailTemplate,
    };
    await transporter.sendMail(message).catch((err) => {
      throw err;
    });
    res.status(200).json({ msg: "code sent..", token: token });
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function verifyLogin(req, res) {
  try {
    if (!req.body.otp) {
      return res.status(401).json("Must provide otp..");
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }
    const otp = await OTP.findOne({ email: user.email });
    if (!otp) {
      return res.status(404).json({ msg: "No OTP was sent." });
    }
    if (!(await bcrypt.compare(req.body.otp, otp.code))) {
      return res.status(401).json({ msg: "Wrong code." });
    }
    let d = new Date();
    if (Number(d) > Number(otp.expiresAt)) {
      return res.status(400).json({ msg: "OTP has expired." });
    }
    await OTP.deleteMany({ email: user.email });
    let userWithoutPassword = {...user};
    delete userWithoutPassword._doc.password;
    return res.status(200).json(userWithoutPassword._doc);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = {
  userSignupController,
  resendOTP,
  verifyUser,
  loginController,
  verifyLogin,
};

/**
 * after signup => send otp => store otp in database (id, code, email, created at, expires at)
 *
 */
