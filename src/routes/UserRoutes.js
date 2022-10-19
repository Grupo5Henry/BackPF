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

    var verify = {
      from: '"Bienvenido a Techno trade" <technotrade2022g5@gmail.com>',
      to: newUser.email,
      subject: "TechnoTrade -Verify your email",
      html: `<html
        xmlns="http://www.w3.org/1999/xhtml"
        xmlns:v="urn:schemas-microsoft-com:vml"
        xmlns:o="urn:schemas-microsoft-com:office:office"
      >
        <head>
          <!--[if gte mso 9]>
            <xml>
              <o:OfficeDocumentSettings>
                <o:AllowPNG />
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          <![endif]-->
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="x-apple-disable-message-reformatting" />
          <!--[if !mso]><!-->
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <!--<![endif]-->
          <title></title>
      
          <style type="text/css">
            @media only screen and (min-width: 620px) {
              .u-row {
                width: 600px !important;
              }
              .u-row .u-col {
                vertical-align: top;
              }
      
              .u-row .u-col-100 {
                width: 600px !important;
              }
            }
      
            @media (max-width: 620px) {
              .u-row-container {
                max-width: 100% !important;
                padding-left: 0px !important;
                padding-right: 0px !important;
              }
              .u-row .u-col {
                min-width: 320px !important;
                max-width: 100% !important;
                display: block !important;
              }
              .u-row {
                width: calc(100% - 40px) !important;
              }
              .u-col {
                width: 100% !important;
              }
              .u-col > div {
                margin: 0 auto;
              }
            }
            body {
              margin: 0;
              padding: 0;
            }
      
            table,
            tr,
            td {
              vertical-align: top;
              border-collapse: collapse;
            }
      
            p {
              margin: 0;
            }
      
            .ie-container table,
            .mso-container table {
              table-layout: fixed;
            }
      
            * {
              line-height: inherit;
            }
      
            a[x-apple-data-detectors="true"] {
              color: inherit !important;
              text-decoration: none !important;
            }
      
            @media (max-width: 480px) {
              .hide-mobile {
                max-height: 0px;
                overflow: hidden;
                display: none !important;
              }
            }
      
            table,
            td {
              color: #000000;
            }
            #u_body a {
              color: #f1c40f;
              text-decoration: underline;
            }
            @media (max-width: 480px) {
              #u_content_image_1 .v-src-width {
                width: auto !important;
              }
              #u_content_image_1 .v-src-max-width {
                max-width: 35% !important;
              }
              #u_content_heading_1 .v-font-size {
                font-size: 22px !important;
              }
              #u_content_text_1 .v-container-padding-padding {
                padding: 25px 20px 70px !important;
              }
              #u_content_text_1 .v-text-align {
                text-align: justify !important;
              }
              #u_content_text_2 .v-container-padding-padding {
                padding: 50px 20px 10px !important;
              }
              #u_content_menu_1 .v-padding {
                padding: 5px 11px !important;
              }
              #u_content_text_3 .v-container-padding-padding {
                padding: 10px 20px 50px !important;
              }
            }
          </style>
      
          <link
            href="https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap"
            rel="stylesheet"
            type="text/css"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Rubik:400,700&display=swap"
            rel="stylesheet"
            type="text/css"
          />
        </head>
      
        <body
          class="clean-body u_body"
          style="
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            background-color: #506791;
            color: #000000;
          "
        >
          <table
            id="u_body"
            style="
              border-collapse: collapse;
              table-layout: fixed;
              border-spacing: 0;
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
              vertical-align: top;
              min-width: 320px;
              margin: 0 auto;
              background-color: #506791;
              width: 100%;
            "
            cellpadding="0"
            cellspacing="0"
          >
            <tbody>
              <tr style="vertical-align: top">
                <td
                  style="
                    word-break: break-word;
                    border-collapse: collapse !important;
                    vertical-align: top;
                  "
                >
      
                  <div
                    class="u-row-container"
                    style="padding: 0px; background-color: transparent"
                  >
                    <div
                      class="u-row"
                      style="
                        margin: 0 auto;
                        min-width: 320px;
                        max-width: 600px;
                        overflow-wrap: break-word;
                        word-wrap: break-word;
                        word-break: break-word;
                        background-color: transparent;
                      "
                    >
                      <div
                        style="
                          border-collapse: collapse;
                          display: table;
                          width: 100%;
                          height: 100%;
                          background-color: transparent;
                        "
                      >
                        <div
                          class="u-col u-col-100"
                          style="
                            max-width: 320px;
                            min-width: 600px;
                            display: table-cell;
                            vertical-align: top;
                          "
                        >
                          <div
                            style="
                              background-color: #506791;
                              height: 100%;
                              width: 100% !important;
                            "
                          >
                           <div
                              style="
                                height: 100%;
                                padding: 0px;
                                border-top: 0px solid transparent;
                                border-left: 0px solid transparent;
                                border-right: 0px solid transparent;
                                border-bottom: 0px solid transparent;
                              "
                              <table
                                id="u_content_image_1"
                                style="font-family: 'Open Sans', sans-serif"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                border="0"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      class="v-container-padding-padding"
                                      style="
                                        overflow-wrap: break-word;
                                        word-break: break-word;
                                        padding: 30px 10px 10px;
                                        font-family: 'Open Sans', sans-serif;
                                      "
                                      align="left"
                                    >
                                      <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                      >
                                        <tr>
                                          <td
                                            class="v-text-align"
                                            style="
                                              padding-right: 0px;
                                              padding-left: 0px;
                                            "
                                            align="center"
                                          >
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
      
                              <table
                                style="font-family: 'Open Sans', sans-serif"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                border="0"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      class="v-container-padding-padding"
                                      style="
                                        overflow-wrap: break-word;
                                        word-break: break-word;
                                        padding: 0px;
                                        font-family: 'Open Sans', sans-serif;
                                      "
                                      align="left"
                                    >
                                      <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                      >
                                        <tr>
                                          <td
                                            class="v-text-align"
                                            style="
                                              padding-right: 0px;
                                              padding-left: 0px;
                                            "
                                            align="center"
                                          >
                                            <img
                                              align="center"
                                              border="0"
                                              src="https://cdn.appdesign.dev/wp-content/uploads/2020/09/Desarrollo-tiendas-online.jpg"
                                              alt="Image"
                                              title="Image"
                                              style="
                                                outline: none;
                                                text-decoration: none;
                                                -ms-interpolation-mode: bicubic;
                                                clear: both;
                                                display: inline-block !important;
                                                border: none;
                                                height: auto;
                                                float: none;
                                                width: 100%;
                                                max-width: 600px;
                                              "
                                              width="600"
                                              class="v-src-width v-src-max-width"
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
      
                  <div
                    class="u-row-container"
                    style="padding: 0px; background-color: transparent"
                  >
                    <div
                      class="u-row"
                      style="
                        margin: 0 auto;
                        min-width: 320px;
                        max-width: 600px;
                        overflow-wrap: break-word;
                        word-wrap: break-word;
                        word-break: break-word;
                        background-color: transparent;
                      "
                    >
                      <div
                        style="
                          border-collapse: collapse;
                          display: table;
                          width: 100%;
                          height: 100%;
                          background-color: transparent;
                        "
                      >
                        <div
                          class="u-col u-col-100"
                          style="
                            max-width: 320px;
                            min-width: 600px;
                            display: table-cell;
                            vertical-align: top;
                          "
                        >
                          <div
                            style="
                              background-color: #7b97bc;
                              height: 100%;
                              width: 100% !important;
                              border-radius: 0px;
                              -webkit-border-radius: 0px;
                              -moz-border-radius: 0px;
                            "
                          >
                            <div
                              style="
                                height: 100%;
                                padding: 0px;
                                border-top: 0px solid transparent;
                                border-left: 0px solid transparent;
                                border-right: 0px solid transparent;
                                border-bottom: 0px solid transparent;
                                border-radius: 0px;
                                -webkit-border-radius: 0px;
                                -moz-border-radius: 0px;
                              "
                            >
                  
                              <table
                                id="u_content_heading_1"
                                style="font-family: 'Open Sans', sans-serif"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                border="0"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      class="v-container-padding-padding"
                                      style="
                                        overflow-wrap: break-word;
                                        word-break: break-word;
                                        padding: 50px 10px 20px;
                                        font-family: 'Open Sans', sans-serif;
                                      "
                                      align="left"
                                    >
                                      <h1
                                        class="v-text-align v-font-size"
                                        style="
                                          margin: 0px;
                                          color: #ffffff;
                                          line-height: 140%;
                                          text-align: center;
                                          word-wrap: break-word;
                                          font-weight: normal;
                                          font-family: 'Rubik', sans-serif;
                                          font-size: 26px;
                                        "
                                      >
                                        <div>
                                          <strong>GRACIAS POR REGISTRARTE</strong
                                          ><br /><strong>A TECHNO TRADE</strong>
                                        </div>
                                      </h1>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
      
                              <table
                                id="u_content_text_1"
                                style="font-family: 'Open Sans', sans-serif"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                border="0"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      class="v-container-padding-padding"
                                      style="
                                        overflow-wrap: break-word;
                                        word-break: break-word;
                                        padding: 25px 50px 70px;
                                        font-family: 'Open Sans', sans-serif;
                                      "
                                      align="left"
                                    >
                                      <div
                                        class="v-text-align"
                                        style="
                                          color: #ffffff;
                                          line-height: 160%;
                                          text-align: justify;
                                          word-wrap: break-word;
                                        "
                                      >
                                        <p style="font-size: 14px; line-height: 160%">
                                          <span
                                            style="
                                              font-size: 16px;
                                              line-height: 25.6px;
                                            "
                                            ><strong>${newUser.userName}!</strong></span
                                          >
                                        </p>
                                        <p style="font-size: 14px; line-height: 160%">
                                           
                                        </p>
                                        <p style="font-size: 14px; line-height: 160%">
                                          Podras ver los mejores descuentos y productos directamente desde nuestra pagina web
                                        </p>
                                        <p style="font-size: 14px; line-height: 160%">
                                           
                                        </p>
                                        <p style="font-size: 14px; line-height: 160%">
                                         Esta al tanto de los mejores lanzamientos en tecnologia para ti
                                        </p>
                                        <p style="font-size: 14px; line-height: 160%">
                                       Por favor verifica tu email en el siguiente enlace
                                        </p>
                                        <a href="http://${req.headers.host}/user/verify-email?token=${newUser.emailToken}">Verifica tu email</a>
                                       
                                        <p style="font-size: 14px; line-height: 160%">
                                          <strong>Techno trade</strong>
                                        </p>
                                        <p style="font-size: 14px; line-height: 160%">
                                          <strong>2022</strong>
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
      
                  <div
                    class="u-row-container"
                    style="padding: 0px; background-color: transparent"
                  >
                    <div
                      class="u-row"
                      style="
                        margin: 0 auto;
                        min-width: 320px;
                        max-width: 600px;
                        overflow-wrap: break-word;
                        word-wrap: break-word;
                        word-break: break-word;
                        background-color: transparent;
                      "
                    >
                      <div
                        style="
                          border-collapse: collapse;
                          display: table;
                          width: 100%;
                          height: 100%;
                          background-color: transparent;
                        "
                      >
                        <div
                          class="u-col u-col-100"
                          style="
                            max-width: 320px;
                            min-width: 600px;
                            display: table-cell;
                            vertical-align: top;
                          "
                        >
                          <div
                            style="
                              background-color: #506791;
                              height: 100%;
                              width: 100% !important;
                              border-radius: 0px;
                              -webkit-border-radius: 0px;
                              -moz-border-radius: 0px;
                            "
                          >
                           <div
                              style="
                                height: 100%;
                                padding: 0px;
                                border-top: 0px solid transparent;
                                border-left: 0px solid transparent;
                                border-right: 0px solid transparent;
                                border-bottom: 0px solid transparent;
                                border-radius: 0px;
                                -webkit-border-radius: 0px;
                                -moz-border-radius: 0px;
                              "
                            ><!--<![endif]-->
                              <table
                                id="u_content_text_2"
                                style="font-family: 'Open Sans', sans-serif"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                border="0"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      class="v-container-padding-padding"
                                      style="
                                        overflow-wrap: break-word;
                                        word-break: break-word;
                                        padding: 70px 80px 10px;
                                        font-family: 'Open Sans', sans-serif;
                                      "
                                      align="left"
                                    >
                                      <div
                                        class="v-text-align"
                                        style="
                                          color: #ecf0f1;
                                          line-height: 140%;
                                          text-align: center;
                                          word-wrap: break-word;
                                        "
                                      >
                                        <p style="font-size: 14px; line-height: 140%">
                                          Si tienes preguntas, por favor escribenos al
                                          email
                                          <a
                                            rel="noopener"
                                            href="https://www.unlayer.com"
                                            target="_blank"
                                            >technotrade2022g5@gmail.com</a
                                          >
                                          o visita nuestra pagina web
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
      
                              <table
                                style="font-family: 'Open Sans', sans-serif"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                border="0"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      class="v-container-padding-padding"
                                      style="
                                        overflow-wrap: break-word;
                                        word-break: break-word;
                                        padding: 20px;
                                        font-family: 'Open Sans', sans-serif;
                                      "
                                      align="left"
                                    >
                                      <table
                                        height="0px"
                                        align="center"
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                        width="63%"
                                        style="
                                          border-collapse: collapse;
                                          table-layout: fixed;
                                          border-spacing: 0;
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                          vertical-align: top;
                                          border-top: 1px solid #95a5a6;
                                          -ms-text-size-adjust: 100%;
                                          -webkit-text-size-adjust: 100%;
                                        "
                                      >
                                        <tbody>
                                          <tr style="vertical-align: top">
                                            <td
                                              style="
                                                word-break: break-word;
                                                border-collapse: collapse !important;
                                                vertical-align: top;
                                                font-size: 0px;
                                                line-height: 0px;
                                                mso-line-height-rule: exactly;
                                                -ms-text-size-adjust: 100%;
                                                -webkit-text-size-adjust: 100%;
                                              "
                                            >
                                              <span>&#160;</span>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
      
                              <table
                                style="font-family: 'Open Sans', sans-serif"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                border="0"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      class="v-container-padding-padding"
                                      style="
                                        overflow-wrap: break-word;
                                        word-break: break-word;
                                        padding: 10px;
                                        font-family: 'Open Sans', sans-serif;
                                      "
                                      align="left"
                                    >
                                      <div align="center">
                                        <div style="display: table; max-width: 187px">
                                          <table
                                            align="left"
                                            border="0"
                                            cellspacing="0"
                                            cellpadding="0"
                                            width="32"
                                            height="32"
                                            style="
                                              width: 32px !important;
                                              height: 32px !important;
                                              display: inline-block;
                                              border-collapse: collapse;
                                              table-layout: fixed;
                                              border-spacing: 0;
                                              mso-table-lspace: 0pt;
                                              mso-table-rspace: 0pt;
                                              vertical-align: top;
                                              margin-right: 15px;
                                            "
                                          >
                                            <tbody>
                                              <tr style="vertical-align: top">
                                                <td
                                                  align="left"
                                                  valign="middle"
                                                  style="
                                                    word-break: break-word;
                                                    border-collapse: collapse !important;
                                                    vertical-align: top;
                                                  "
                                                >
                                                  <a
                                                    href="https://www.facebook.com/profile.php?id=100086735589914"
                                                    title="Facebook"
                                                    target="_blank"
                                                  >
                                                    <img
                                                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/2048px-Facebook_f_logo_%282019%29.svg.png"
                                                      alt="Facebook"
                                                      title="Facebook"
                                                      width="32"
                                                      style="
                                                        outline: none;
                                                        text-decoration: none;
                                                        -ms-interpolation-mode: bicubic;
                                                        clear: both;
                                                        display: block !important;
                                                        border: none;
                                                        height: auto;
                                                        float: none;
                                                        max-width: 32px !important;
                                                      "
                                                    />
                                                  </a>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                          <table
                                            align="left"
                                            border="0"
                                            cellspacing="0"
                                            cellpadding="0"
                                            width="32"
                                            height="32"
                                            style="
                                              width: 32px !important;
                                              height: 32px !important;
                                              display: inline-block;
                                              border-collapse: collapse;
                                              table-layout: fixed;
                                              border-spacing: 0;
                                              mso-table-lspace: 0pt;
                                              mso-table-rspace: 0pt;
                                              vertical-align: top;
                                              margin-right: 15px;
                                            "
                                          >
                                            <tbody>
                                              <tr style="vertical-align: top">
                                                <td
                                                  align="left"
                                                  valign="middle"
                                                  style="
                                                    word-break: break-word;
                                                    border-collapse: collapse !important;
                                                    vertical-align: top;
                                                  "
                                                >
                                                  <a
                                                    href="https://twitter.com/technotrade2022"
                                                    title="Twitter"
                                                    target="_blank"
                                                  >
                                                    <img
                                                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Twitter-logo.svg/292px-Twitter-logo.svg.png"
                                                      alt="Twitter"
                                                      title="Twitter"
                                                      width="32"
                                                      style="
                                                        outline: none;
                                                        text-decoration: none;
                                                        -ms-interpolation-mode: bicubic;
                                                        clear: both;
                                                        display: block !important;
                                                        border: none;
                                                        height: auto;
                                                        float: none;
                                                        max-width: 32px !important;
                                                      "
                                                    />
                                                  </a>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
      
                                          <table
                                            align="left"
                                            border="0"
                                            cellspacing="0"
                                            cellpadding="0"
                                            width="32"
                                            height="32"
                                            style="
                                              width: 32px !important;
                                              height: 32px !important;
                                              display: inline-block;
                                              border-collapse: collapse;
                                              table-layout: fixed;
                                              border-spacing: 0;
                                              mso-table-lspace: 0pt;
                                              mso-table-rspace: 0pt;
                                              vertical-align: top;
                                              margin-right: 0px;
                                            "
                                          >
                                            <tbody>
                                              <tr style="vertical-align: top">
                                                <td
                                                  align="left"
                                                  valign="middle"
                                                  style="
                                                    word-break: break-word;
                                                    border-collapse: collapse !important;
                                                    vertical-align: top;
                                                  "
                                                >
                                                  <a
                                                    href="https://www.instagram.com/technotrade2022g5/"
                                                    title="Instagram"
                                                    target="_blank"
                                                  >
                                                    <img
                                                      src="https://eltallerdehector.com/wp-content/uploads/2022/06/cd939-logo-instagram-png.png"
                                                      alt="Instagram"
                                                      title="Instagram"
                                                      width="32"
                                                      style="
                                                        outline: none;
                                                        text-decoration: none;
                                                        -ms-interpolation-mode: bicubic;
                                                        clear: both;
                                                        display: block !important;
                                                        border: none;
                                                        height: auto;
                                                        float: none;
                                                        max-width: 32px !important;
                                                      "
                                                    />
                                                  </a>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                 
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
      
                              <table
                                id="u_content_menu_1"
                                style="font-family: 'Open Sans', sans-serif"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                border="0"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      class="v-container-padding-padding"
                                      style="
                                        overflow-wrap: break-word;
                                        word-break: break-word;
                                        padding: 10px;
                                        font-family: 'Open Sans', sans-serif;
                                      "
                                      align="left"
                                    >
                                      <div class="menu" style="text-align: center">
                           
                                        <a
                                          href="https://front-wheat-gamma.vercel.app/home"
                                          target="_self"
                                          style="
                                            padding: 5px 15px;
                                            display: inline-block;
                                            color: #ffffff;
                                            font-family: 'Open Sans', sans-serif;
                                            font-size: 14px;
                                            text-decoration: none;
                                          "
                                          class="v-padding v-font-size"
                                        >
                                          Home
                                        </a>
                                        <span
                                          style="
                                            padding: 5px 15px;
                                            display: inline-block;
                                            color: #ffffff;
                                            font-family: 'Open Sans', sans-serif;
                                            font-size: 14px;
                                          "
                                          class="v-padding v-font-size hide-mobile"
                                        >
                                          |
                                        </span>
      
                                        <a
                                          href="https://front-wheat-gamma.vercel.app/about"
                                          target="_self"
                                          style="
                                            padding: 5px 15px;
                                            display: inline-block;
                                            color: #ffffff;
                                            font-family: 'Open Sans', sans-serif;
                                            font-size: 14px;
                                            text-decoration: none;
                                          "
                                          class="v-padding v-font-size"
                                        >
                                          About Us
                                        </a>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
      
                              <table
                                id="u_content_text_3"
                                style="font-family: 'Open Sans', sans-serif"
                                role="presentation"
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                border="0"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      class="v-container-padding-padding"
                                      style="
                                        overflow-wrap: break-word;
                                        word-break: break-word;
                                        padding: 10px 10px 70px;
                                        font-family: 'Open Sans', sans-serif;
                                      "
                                      align="left"
                                    >
                                      <div
                                        class="v-text-align"
                                        style="
                                          color: #ffffff;
                                          line-height: 140%;
                                          text-align: center;
                                          word-wrap: break-word;
                                        "
                                      >
                                        <p style="font-size: 14px; line-height: 140%">
                                          Recibiste este email porque te registraste
                                          en technotrade
                                        </p>
      
                                        <p style="font-size: 14px; line-height: 140%">
                                          Techno Trade 2022 All rights reserved
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
      
                </td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
      `,
    };

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
      verified: user.verified,
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
    const link = `${FRONT_URL}/resetPassword/${oldUser.userName}/${token}`;
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
    res.status(201);
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
    res.status(201);
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
