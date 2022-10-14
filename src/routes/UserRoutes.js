const { Router } = require("express");
const { User, conn } = require("../db");
const { Op, where } = require("sequelize");
const router = Router();
const authToken = require("./middleware/authenticateToken");
const adminCheck = require("./middleware/adminCheck");
const JWT = require("jsonwebtoken");
const axios = require("axios");
const bcrypt = require("bcrypt");
const crypto = require('crypto')
const nodemailer = require ('nodemailer')
const {
  password
} = process.env;
// const verifyEmail = require('./middleware/loginCheck')

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user:'technotrade2022g5@gmail.com',
    pass:password
  },
  tls:{
    rejectUnauthorized: false
  }
})

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
      emailToken: crypto.randomBytes(64).toString('hex'),
      verified: false
    });
    //enviar mensaje de verificacion 

    var mailOptions = {
      from: '"Verify your email" <technotrade2022g5@gmail.com>',
      to: newUser.email,
      subject: 'TechnoTrade -Verify your email',
      html: `<h2>${newUser.userName}! Gracias por registrarse en nuestra web</h2>
      <h4>Por favor verifica tu email para continuar</h4>
      <a href="http://${req.headers.host}/user/verify-email?token=${newUser.emailToken}">Verifica tu email</a>
      `
    }
    //Enviar mensajee
    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        console.log(error)
      }else{
        console.log('Email de verificacion es enviado a tu correo')
      }
    })
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
    });
  } catch (err) {
    res.send({ error: err.message });
  }
});

router.get('/verify-email', async(req, res) => {
  try{
    const token = req.query.token
    const user = await User.findOne({
      where: {
        emailToken: token
      }
    
    })
    if(user){
     
      await user.update(
        {
          emailToken:null,
          verified: true
          
        }
      )
      res.redirect(`${FRONT_URL}/home`)
    }else{
      res.redirect(`${FRONT_URL}/`)
      console.log('email is not verified')
    }
  }catch(err){
    console.log(err)
  }

}) 
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
    });
  } catch (err) {
    res.send({ error: err.message });
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
