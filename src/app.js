const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const routes = require("./routes/index.js");
const { BACK_URL, FRONT_URL, CORS_URL } = require("./constantes");
///AUTH
//const cookieSession = require("cookie-session");
const session = require("express-session");
const cors = require("cors");
const passportSetup = require("./auth/passport");
const passport = require("passport");
///AUTH

require("./db.js");

const server = express();

server.name = "API";

server.set("view engine", "ejs");
server.use("/stripe/webhook", express.raw({ type: "*/*" }));
server.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
server.use(bodyParser.json({ limit: "50mb" }));
server.use((req, res, next) => {
  if (req.originalUrl === "/stripe/webhook") {
    next(); // Do nothing with the body because I need it in a raw state.
  } else {
    express.json()(req, res, next); // ONLY do express.json() if the received request is NOT a WebHook from Stripe.
  }
});

server.use(cookieParser("estoesunsecreto"));

server.use(morgan("dev"));

//////////PASSPORT ojo que hay un import de cors mas arriba

server.use(
  session({
    secret: "estoesunsecreto",
    resave: false,
    saveUninitialized: false,
    cookie: { sameSite: "none", secure: true, maxAge: 1 * 60 * 60 * 1000 },
  })
); //deploy
// server.use(session({secret: 'estoesunsecreto', resave:false,saveUninitialized:false, cookie : {maxAge:(1 * 60 * 60 * 1000)}}))//local
server.use(passport.initialize());
server.use(passport.session());
server.use(
  cors({
    origin: CORS_URL, //react
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
    allowedHeaders:
      "X-Requested-With, x-auth-token, X-HTTP-Method-Override, Content-Type, Accept, access-control-allow-credentials",
  })
);
server.set("trust proxy", 1);
//////////PASSPORT

server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", CORS_URL); // update to match the domain you will make the request from

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "X-AUTH-TOKEN, Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

server.use("/", routes);

// Error catching endware.
server.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || err;
  //console.error(err);
  res.status(status).send(message);
});

module.exports = server;
