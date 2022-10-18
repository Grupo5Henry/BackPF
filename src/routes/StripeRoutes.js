const { Router } = require("express");
const { User, Product } = require("../db");
const nodemailer = require("nodemailer");
const { password } = require("../constantes.js");
const router = Router();

const { BACK_URL, FRONT_URL } = require("../constantes");
const bodyParser = require("body-parser");
const { default: axios } = require("axios");

const { STRIPE_PRIVATE_KEY } = process.env;
const stripe = require("stripe")(STRIPE_PRIVATE_KEY);
const { endpointSecret } = process.env;

module.exports = router;

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

const fulfillOrder = async (session) => {
  const { orderNumber } = session.metadata;
  try {
    axios.put(`${BACK_URL}/order/change`, {
      orderNumber,
      newStatus: "PaidPendingDelivery",
      sessionId: 1,
    });
  } catch (err) {
    console.log({ error: err.message });
  }
};

const cancelOrder = async (session) => {
  const { orderNumber } = session.metadata;
  try {
    await axios.put(`${BACK_URL}/order/change`, {
      orderNumber,
      newStatus: "Cancelled",
      sessionId: 1,
    });
  } catch (err) {
    console.log({ error: err.message });
  }
  Object.entries(session.metadata)
    .filter(([key, _]) => key !== "orderNumber" || key !== "userName")
    .map(async ([productId, amount]) => {
      try {
        await Product.increment(
          { stock: +amount, sold: -amount },
          { where: { id: productId } }
        );
      } catch (err) {
        console.log({ error: err.message });
      }
      return [productId, amount];
    });

  return true;
};

router.post("/checkout", async (req, res) => {
  const { cart, orderNumber, userName } = req.body;

  try {
    const line_items = await Promise.all(
      cart.map(async (product) => {
        let price = await Product.findByPk(product.product.id, {
          attributes: ["price"],
        });
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.product.name,
              metadata: { id: product.product.id },
            },
            unit_amount: price.dataValues.price * 100,
          },
          quantity: product.amount,
        };
      })
    );
    let sessionCart = {};
    cart.map((product) => (sessionCart[product.productId] = product.amount));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: line_items,
      success_url: `${FRONT_URL}/home`,
      cancel_url: `${FRONT_URL}/profile`,
      metadata: { orderNumber, userName, ...sessionCart },
    });
    // console.log(session.url);
    try {
      axios.put(`${BACK_URL}/order/change`, {
        orderNumber,
        sessionId: session.id,
      });
    } catch (err) {
      console.log({ error: err.message });
    }

    const user = await User.findByPk(userName);

    const notice = {
      from: '"Recibimos tu orden" <technotrade2022g5@gmail.com>',
      to: user.email,
      subject: "TechnoTrade Confirmacion de orden",
      html: `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    
      <head>
        <!--[if gte mso 9]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="x-apple-disable-message-reformatting">
        <!--[if !mso]><!-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <!--<![endif]-->
        <title></title>
      
        <style type="text/css">
          @media only screen and (min-width: 520px) {
            .u-row {
              width: 500px !important;
            }
            .u-row .u-col {
              vertical-align: top;
            }
            .u-row .u-col-100 {
              width: 500px !important;
            }
          }
          
          @media (max-width: 520px) {
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
            .u-col>div {
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
          
          a[x-apple-data-detectors='true'] {
            color: inherit !important;
            text-decoration: none !important;
          }
          
          table,
          td {
            color: #000000;
          }
          
          #u_body a {
            color: #0000ee;
            text-decoration: underline;
          }
        </style>
      
      
      
      </head>
      
      <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #e7e7e7;color: #000000">
        <!--[if IE]><div class="ie-container"><![endif]-->
        <!--[if mso]><div class="mso-container"><![endif]-->
        <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #e7e7e7;width:100%" cellpadding="0" cellspacing="0">
          <tbody>
            <tr style="vertical-align: top">
              <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #e7e7e7;"><![endif]-->
      
      
                <div class="u-row-container" style="padding: 0px;background-color: transparent">
                  <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px;"><tr style="background-color: transparent;"><![endif]-->
      
                      <!--[if (mso)|(IE)]><td align="center" width="500" style="width: 500px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                      <div class="u-col u-col-100" style="max-width: 320px;min-width: 500px;display: table-cell;vertical-align: top;">
                        <div style="height: 100%;width: 100% !important;">
                          <!--[if (!mso)&(!IE)]><!-->
                          <div style="height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                            <!--<![endif]-->
      
                            <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
      
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                      <tr>
                                        <td style="padding-right: 0px;padding-left: 0px;" align="justify">
      
                                          <img align="justify" border="0" src="http://cdn.shopify.com/s/files/1/0426/9209/articles/e-commerce-el-presente-y-el-futuro-de-las-ventas-en-linea_1200x1200.png?v=1597172403" alt="" title="" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 480px;"
                                            width="480" />
      
                                        </td>
                                      </tr>
                                    </table>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
      
                                    <h1 style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: arial,helvetica,sans-serif; font-size: 22px;">
                                      ¡Gracias por tu compra!
                                    </h1>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
      
                                    <div style="line-height: 140%; text-align: left; word-wrap: break-word;">
                                      <p style="font-size: 14px; line-height: 140%;">Gracias por su compra,</p>
                                      <p style="font-size: 14px; line-height: 140%;"><br />Estamos felices de hacerte saber que ya recibimos tu orden.</p>
                                      <p style="font-size: 14px; line-height: 140%;"> </p>
                                      <p style="font-size: 14px; line-height: 140%;">Una vez que tus productos esten listos, te enviaremos un correo electronico con un link donde podras ver el estado de tus productos.</p>
                                      <p style="font-size: 14px; line-height: 140%;"> </p>
                                      <p style="font-size: 14px; line-height: 140%;"> </p>
                                      <p style="font-size: 14px; line-height: 140%;"> </p>
                                      <p style="font-size: 14px; line-height: 140%;">¿Necesitas ayuda?<br />Si tienes dudas acerca de tu pedido, no dudes en escribirnos al correo <a rel="noopener" href="mailto:technotrade2022g5@gmail.com" target="_blank">technotrade2022g5@gmail.com</a></p>
                                      <p style="font-size: 14px; line-height: 140%;"> </p>
                                      <p style="font-size: 14px; line-height: 140%;">Recuerda estar al tanto de los nuevos productos y promociones que tenemos para ti!</p>
                                      <p style="font-size: 14px; line-height: 140%;"> </p>
                                      <p style="font-size: 14px; line-height: 140%;"> </p>
                                      <p style="font-size: 14px; line-height: 140%;"> </p>
                                    </div>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
      
                                    <!--[if mso]><style>.v-button {background: transparent !important;}</style><![endif]-->
                                    <div align="center">
                                      <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:37px; v-text-anchor:middle; width:171px;" arcsize="11%"  stroke="f" fillcolor="#002736"><w:anchorlock/><center style="color:#FFFFFF;font-family:arial,helvetica,sans-serif;"><![endif]-->
                                      <a href="https://front-wheat-gamma.vercel.app/" target="_blank" class="v-button" style="box-sizing: border-box;display: inline-block;font-family:arial,helvetica,sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #002736; border-radius: 4px;-webkit-border-radius: 4px; -moz-border-radius: 4px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;">
                                        <span style="display:block;padding:10px 20px;line-height:120%;"><span style="font-size: 14px; line-height: 16.8px;">Visita nuestra pagina</span></span>
                                      </a>
                                      <!--[if mso]></center></v:roundrect><![endif]-->
                                    </div>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
      
                                    <div align="center">
                                      <div style="display: table; max-width:110px;">
                                        <!--[if (mso)|(IE)]><table width="110" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:110px;"><tr><![endif]-->
      
      
                                        <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 5px;" valign="top"><![endif]-->
                                        <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 5px">
                                          <tbody>
                                            <tr style="vertical-align: top">
                                              <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                <a href="https://facebook.com/" title="Facebook" target="_blank">
                                                  <img src="https://cdn.tools.unlayer.com/social/icons/circle/facebook.png" alt="Facebook" title="Facebook" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                </a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <!--[if (mso)|(IE)]></td><![endif]-->
      
                                        <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 5px;" valign="top"><![endif]-->
                                        <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 5px">
                                          <tbody>
                                            <tr style="vertical-align: top">
                                              <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                <a href="https://instagram.com/" title="Instagram" target="_blank">
                                                  <img src="https://cdn.tools.unlayer.com/social/icons/circle/instagram.png" alt="Instagram" title="Instagram" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                </a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <!--[if (mso)|(IE)]></td><![endif]-->
      
                                        <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
                                        <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
                                          <tbody>
                                            <tr style="vertical-align: top">
                                              <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                <a href="https://twitter.com/" title="Twitter" target="_blank">
                                                  <img src="https://cdn.tools.unlayer.com/social/icons/circle/twitter.png" alt="Twitter" title="Twitter" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                </a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <!--[if (mso)|(IE)]></td><![endif]-->
      
      
                                        <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                      </div>
                                    </div>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                              <tbody>
                                <tr>
                                  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
      
                                    <div style="line-height: 140%; text-align: left; word-wrap: break-word;">
                                      <p style="font-size: 14px; line-height: 140%; text-align: center;">Techno Trade 2022.</p>
                                      <p style="font-size: 14px; line-height: 140%; text-align: center;">All rights reserved.</p>
                                    </div>
      
                                  </td>
                                </tr>
                              </tbody>
                            </table>
      
                            <!--[if (!mso)&(!IE)]><!-->
                          </div>
                          <!--<![endif]-->
                        </div>
                      </div>
                      <!--[if (mso)|(IE)]></td><![endif]-->
                      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                    </div>
                  </div>
                </div>
      
      
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
        <!--[if mso]></div><![endif]-->
        <!--[if IE]></div><![endif]-->
      </body>
      
      </html>`,
    };

    transporter.sendMail(notice, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email de verificacion es enviado a tu correo");
      }
    });
    res.json({ url: session.url });
  } catch (err) {
    // console.log(err.message)
    res.status(500).send({ error: err.message });
  }
});

router.post("/webhook", async (request, response) => {
  const payload = request.body;
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.log({ error: err.message });
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userName } = session.metadata;
    const user = await User.findByPk(userName);

    if (session.payment_status === "paid") {
      // Fulfill the purchase...

      const orderInWay = {
        from: '"¡Hemos enviado tu pedido!" <technotrade2022g5@gmail.com>',
        to: user.email,
        subject: "TechnoTrade -Orden despachada",
        html: `
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      
        <head>
          <!--[if gte mso 9]>
        <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="x-apple-disable-message-reformatting">
          <!--[if !mso]><!-->
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <!--<![endif]-->
          <title></title>
        
          <style type="text/css">
            @media only screen and (min-width: 520px) {
              .u-row {
                width: 500px !important;
              }
              .u-row .u-col {
                vertical-align: top;
              }
              .u-row .u-col-100 {
                width: 500px !important;
              }
            }
            
            @media (max-width: 520px) {
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
              .u-col>div {
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
            
            a[x-apple-data-detectors='true'] {
              color: inherit !important;
              text-decoration: none !important;
            }
            
            table,
            td {
              color: #000000;
            }
            
            #u_body a {
              color: #0000ee;
              text-decoration: underline;
            }
          </style>
        
        
        
        </head>
        
        <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #e7e7e7;color: #000000">
          <!--[if IE]><div class="ie-container"><![endif]-->
          <!--[if mso]><div class="mso-container"><![endif]-->
          <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #e7e7e7;width:100%" cellpadding="0" cellspacing="0">
            <tbody>
              <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #e7e7e7;"><![endif]-->
        
        
                  <div class="u-row-container" style="padding: 0px;background-color: transparent">
                    <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                      <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                        <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px;"><tr style="background-color: transparent;"><![endif]-->
        
                        <!--[if (mso)|(IE)]><td align="center" width="500" style="width: 500px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                        <div class="u-col u-col-100" style="max-width: 320px;min-width: 500px;display: table-cell;vertical-align: top;">
                          <div style="height: 100%;width: 100% !important;">
                            <!--[if (!mso)&(!IE)]><!-->
                            <div style="height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                              <!--<![endif]-->
        
                              <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                  <tr>
                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
        
                                      <h1 style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: arial,helvetica,sans-serif; font-size: 22px;">
                                        <div>
                                          <div><span style="text-decoration: underline;"><strong>¡Tu orden ya esta en camino!</strong></span></div>
                                        </div>
                                      </h1>
        
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
        
                              <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                  <tr>
                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
        
                                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                          <td style="padding-right: 0px;padding-left: 0px;" align="center">
        
                                            <img align="center" border="0" src="https://i0.wp.com/chocale.cl/wp-content/uploads/2021/04/productos-esenciales-delivery-repartidores-cuarentena.jpg?resize=800%2C500&ssl=1" alt="" title="" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 480px;"
                                              width="480" />
        
                                          </td>
                                        </tr>
                                      </table>
        
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
        
                              <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                  <tr>
                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
        
                                      <div style="line-height: 140%; text-align: justify; word-wrap: break-word;">
                                        <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 18px; line-height: 25.2px;">Hola {nombre}</span></p>
                                        <p style="font-size: 14px; line-height: 140%;"> </p>
                                        <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 16px; line-height: 22.4px;">Tu pedido ha sido despachado y esta de camino <strong>AHORA🚀</strong></span></p>
                                        <p style="font-size: 14px; line-height: 140%;"> </p>
                                        <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 16px; line-height: 22.4px;"><strong>Numero de orden:</strong></span></p>
                                        <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 16px; line-height: 22.4px;"><strong>{orden_number}</strong></span></p>
                                        <p style="font-size: 14px; line-height: 140%;"> </p>
                                        <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 16px; line-height: 22.4px;">Tu pedido llegara a la siguiente direccion que nos indicaste {direccion}</span></p>
                                        <p style="font-size: 14px; line-height: 140%;"> </p>
                                        <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 16px; line-height: 22.4px;">No olvides darle a tus productos una  calificacion y una reseña en nuestra pagina web</span></p>
                                        <p style="font-size: 14px; line-height: 140%;"> </p>
                                      </div>
        
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
        
                              <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                  <tr>
                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
        
                                      <div align="center">
                                        <div style="display: table; max-width:110px;">
                                          <!--[if (mso)|(IE)]><table width="110" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:110px;"><tr><![endif]-->
        
        
                                          <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 5px;" valign="top"><![endif]-->
                                          <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 5px">
                                            <tbody>
                                              <tr style="vertical-align: top">
                                                <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                  <a href="https://facebook.com/" title="Facebook" target="_blank">
                                                    <img src="https://cdn.tools.unlayer.com/social/icons/circle/facebook.png" alt="Facebook" title="Facebook" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                  </a>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                          <!--[if (mso)|(IE)]></td><![endif]-->
        
                                          <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 5px;" valign="top"><![endif]-->
                                          <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 5px">
                                            <tbody>
                                              <tr style="vertical-align: top">
                                                <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                  <a href="https://twitter.com/" title="Twitter" target="_blank">
                                                    <img src="https://cdn.tools.unlayer.com/social/icons/circle/twitter.png" alt="Twitter" title="Twitter" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                  </a>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                          <!--[if (mso)|(IE)]></td><![endif]-->
        
                                          <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
                                          <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
                                            <tbody>
                                              <tr style="vertical-align: top">
                                                <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                  <a href="https://instagram.com/" title="Instagram" target="_blank">
                                                    <img src="https://cdn.tools.unlayer.com/social/icons/circle/instagram.png" alt="Instagram" title="Instagram" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                  </a>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                          <!--[if (mso)|(IE)]></td><![endif]-->
        
        
                                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                        </div>
                                      </div>
        
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
        
                              <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                <tbody>
                                  <tr>
                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
        
                                      <div style="line-height: 140%; text-align: left; word-wrap: break-word;">
                                        <p style="font-size: 14px; line-height: 140%; text-align: center;">Techno Trade 2022.</p>
                                        <p style="font-size: 14px; line-height: 140%; text-align: center;">All rights reserved</p>
                                      </div>
        
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
        
                              <!--[if (!mso)&(!IE)]><!-->
                            </div>
                            <!--<![endif]-->
                          </div>
                        </div>
                        <!--[if (mso)|(IE)]></td><![endif]-->
                        <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                      </div>
                    </div>
                  </div>
        
        
                  <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
          <!--[if mso]></div><![endif]-->
          <!--[if IE]></div><![endif]-->
        </body>
        
        </html>
      
      `,
      };
      transporter.sendMail(orderInWay, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email de verificacion es enviado a tu correo");
        }
      });

      await fulfillOrder(session);
    }
  }
  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const { userName } = session.metadata;

    cancelOrder(session);
  }
  console.log("aca");
  response.status(200);
});

router.post("/retrieve", async (req, res) => {
  const { id } = req.body;
  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    res.send(session.url);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post("/expire", async (req, res) => {
  const { id } = req.body;
  try {
    const session = await stripe.checkout.sessions.expire(id);
    res.send("Session expired");
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});
