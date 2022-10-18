const { FRONT_URL, BACK_URL } = require("../constantes.js");
const { Router } = require("express");
const { User, conn } = require("../db");
const { Op, where } = require("sequelize");
const router = Router();
const authToken = require("./middleware/authenticateToken");
const adminCheck = require("./middleware/adminCheck");
const JWT = require("jsonwebtoken");
const axios = require("axios");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { password } = require("../constantes.js");
import { verify } from "../MailTemplates/Verify";

// const { password } = process.env;
// const verifyEmail = require('./middleware/loginCheck')

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "technotrade2022g5@gmail.com",
    pass: password,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

router.post("/signup", async (req, res) => {
  const {
    userName,
    password,
    email,
    defaultShippingAddress,
    billingAddress,
    role,
  } = req.body;
  try {
    const user = await User.findOne({
      where: {
        userName: userName,
      },
    });
    if (user) {
      // 422 Unprocessable Entity: server understands the content type of the request entity
      // 200 Ok: Gmail, Facebook, Amazon, Twitter are returning 200 for user already exists
      return res.status(200).json({
        errors: [
          {
            userName: user.email,
            msg: "The user already exists",
          },
        ],
      });
    }

    // Hash password before saving to database
    const salt = await bcrypt.genSalt(10);
    // console.log("salt:", salt);
    const hashedPassword = await bcrypt.hash(password, salt);
    // console.log("hashed password:", hashedPassword);

    const newUser = await User.create({
      role,
      userName,
      email,
      password: hashedPassword,
      defaultShippingAddress,
      billingAddress,
      emailToken: crypto.randomBytes(64).toString("hex"),
      verified: false,
      mute: false,
    });
    //enviar mensaje de verificacion

    //Enviar mensajee
    transporter.sendMail(verify, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email de verificacion es enviado a tu correo");
      }
    });
    ////////////////////////
    const accessToken = await JWT.sign(
      { userName, role, defaultShippingAddress },
      "ACCESS_TOKEN_SECRET",
      {
        expiresIn: "3600s",
      }
    );

    const refreshToken = await JWT.sign(
      { userName, role: "refresh", defaultShippingAddress },
      "ACCESS_TOKEN_SECRET",
      {
        expiresIn: "4200s",
      }
    );
    // console.log(accessToken, refreshToken);
    res.json({
      accessToken,
      refreshToken,
      userName,
      role: role,
      defaultShippingAddress: defaultShippingAddress,
      billingAddress: billingAddress, //esto se debe descartar
      verified: false,
      mute: false,
    });
  } catch (err) {
    res.send({ error: err.message });
  }
});

router.get("/verify-email", async (req, res) => {
  try {
    const token = req.query.token;
    const user = await User.findOne({
      where: {
        emailToken: token,
      },
    });
    if (user) {
      await user.update({
        emailToken: null,
        verified: true,
      });
      res.redirect(`${FRONT_URL}/home`);
    } else {
      res.redirect(`${FRONT_URL}/`);
      console.log("email is not verified");
    }
  } catch (err) {
    console.log(err);
  }
});
router.post("/login", async (req, res) => {
  const { userName, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        userName,
        banned: false,
      },
    });

    // If user not found, send error message
    if (!user) {
      return res.status(400).json({
        errors: [
          {
            msg: "Invalid credentials",
          },
        ],
      });
    }

    // Compare hased password with user password to see if they are valid
    let isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        errors: [
          {
            msg: "Email or password is invalid",
          },
        ],
      });
    }

    // Send JWT
    const accessToken = await JWT.sign(
      {
        userName,
        role: user.role,
        defaultShippingAddress: user.defaultShippingAddress,
      },
      "ACCESS_TOKEN_SECRET",
      {
        expiresIn: "3600s",
      }
    );

    const refreshToken = await JWT.sign(
      {
        userName,
        role: "refresh",
        defaultShippingAddress: user.defaultShippingAddress,
      },
      "ACCESS_TOKEN_SECRET",
      {
        expiresIn: "4200s",
      }
    );

    res.json({
      accessToken,
      refreshToken,
      userName,
      role: user.role,
      defaultShippingAddress: user.defaultShippingAddress,
      billingAddress: user.billingAddress,
      veryfied: user.verified,
      mute: user.mute,
    });
  } catch (err) {
    res.send({ error: err.message });
  }
});

//Olvidar contraseña

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!oldUser) {
      return res.json({ status: "Usuario no existe" });
    }
    const secret = "ACCESS_TOKEN_SECRET" + oldUser.password;
    const token = JWT.sign(
      {
        email: oldUser.email,
        userName: oldUser.userName,
      },
      secret,
      {
        expiresIn: "5m",
      }
    );
    const link = `${FRONT_URL}/resetPassword/${oldUser.userName}/${token}`
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "technotrade2022g5@gmail.com",
        pass: password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    var mailOptions = {
      from: "technotrade2022g5@gmail.com",
      to: oldUser.email,
      subject: "Restaura tu contraseña",
      html: `
      <h4>Hola ${oldUser.userName} </h4>
      <p>¿Olvidaste tu contraseña?</p>
      <p>Recibimos una solicitud para restaurar tu contraseña, haz click en el siguiente enlace</p>
      <p>${link}</p>`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Mensaje enviado" + info.response);
      }
    });
    console.log(oldUser.userName);

    console.log(link);
  } catch (err) {
    console.log(err);
  }
});
router.get("/reset-password/:userName/:token", async (req, res) => {
  const { userName, token } = req.params;
  console.log(req.params);
  const oldUser = await User.findOne({
    where: {
      userName: userName,
    },
  });
  if (!oldUser) {
    return res.json({ status: "Usuario no existe" });
  }
  const secret = "ACCESS_TOKEN_SECRET" + oldUser.password;
  try {
    const verify = JWT.verify(token, secret);
    // res.render("index", { email: verify.email, status: "No verificado" });
    res.status(201)

  } catch (err) {
    res.send("No verificado");
    console.log(err);
  }
});

router.post("/reset-password/:userName/:token", async (req, res) => {
  const { userName, token } = req.params;
  const { password } = req.body;
  const oldUser = await User.findOne({
    where: {
      userName: userName,
    },
  });
  if (!oldUser) {
    return res.json({ status: "Usuario no existe" });
  }
  const secret = "ACCESS_TOKEN_SECRET" + oldUser.password;
  try {
    const verify = JWT.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    let newPassword = await User.findOne({
      where: {
        userName: userName,
      },
    });
    newPassword.set({
      password: encryptedPassword,
    });
    newPassword = await newPassword.save();
    // res.render("index", { email: verify.email, status: "verificado" });
    res.status(201)

  } catch (err) {
    res.json({ status: "Algo salio mal" });
    console.log(err);
  }
});
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
      where: { userName: { [Op.not]: "owner" } },
    });
    return res.send(users);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/userAddress", async (req, res) => {
  try {
    var { userName } = req.query;
    const shippingAddress = await conn.models.User.findByPk(userName, {
      attributes: ["defaultShippingAddress"],
    });
    res.send(shippingAddress);
  } catch (e) {
    res.send(e.message);
  }
});

// Cualquier llamada a esta ruta no puede tener un valor como null
// Puede tener valores que no se manden pero nunca que mandes {key: null}
router.put("/modify", adminCheck, async (req, res) => {
  if (req.userName === "owner") return res.send("Cant modify owner account");
  if (req.role == "admin" || req.role == "superAdmin") {
    let {
      role,
      userName,
      email,
      password,
      defaultShippingAddress,
      billingAddress,
      banned,
      verified,
      mute,
    } = req.body;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
    }
    try {
      await User.update(
        {
          role,
          userName,
          email,
          password,
          defaultShippingAddress,
          billingAddress,
          banned,
          verified,
          mute,
        },
        {
          where: { userName: userName },
        }
      );
      return res.send("User Updated");
    } catch (err) {
      return res.status(400).send({ error: err.message });
    }
  }
  return res.send("Solamente un administrador puede realizar la operación");
});

router.put("/delete/:username", adminCheck, async (req, res) => {
  const userName = req.params.username;

  try {
    await User.update(
      { banned: true },
      {
        where: { userName: userName },
      }
    );
    return res.send("User Banned");
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
});

router.put("/newAddress", async (req, res) => {
  try {
    var { defaultShippingAddress, billingAddress, userName } = req.body;
    // var user = await conn.models.User.findByPk(userName);
    await User.update(
      {
        defaultShippingAddress,
        billingAddress,
      },
      {
        where: {
          userName,
        },
      }
    );
    res.send("Default address updated");
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
