const { Router } = require("express");
const { User } = require("../db");
const { Op, where } = require("sequelize");
const router = Router();
const axios = require("axios");
const passport = require("passport"); /////////PASSPORT
const { BACK_URL, FRONT_URL } = require("../constantes");

//////////PASSPORT

const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect(`${FRONT_URL}/home/log-in`);
};

router.get("/checkCookie", checkAuthenticated, (req, res) => {
  /*  return res.status(200).send("todo bien", {name: req.user.displayName}) */
  res.send({ name: req.user.displayName, id: req.user.id });
});

router.get("/login/success", async (req, res) => {
  console.log(req.session);
  if (req.user) {
    console.log("authroutes.js, req.user: ", req.user.id);
    const usuario = await User.findOrCreate({
      where: { userName: "google:" + req.user.id },
      defaults: {
        role: "user",
        email: "from_google",
        password: "from_google",
        defaultShippingAddress: "from_google",
        billingAddress: "from_google",
        banned: false,
      },
    });
    req.user.password = "";
    res.status(200).json({
      success: true,
      message: "successful",
      user: req.user,
      shipping: usuario[0].defaultShippingAddress,
      role: usuario[0].role,

      /* cookies: req.cookies */
    });
  }
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(`${FRONT_URL}`);
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `${FRONT_URL}/home`,
    failureRedirect: "/login/failed",
  })
);

//////////PASSPORT

module.exports = router;
