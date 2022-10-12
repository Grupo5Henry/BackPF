const { Router } = require("express");
const { User, Product } = require("../db");
const { Op, where } = require("sequelize");
const router = Router();
const axios = require("axios");
const passport = require("passport"); /////////PASSPORT
const { BACK_URL, FRONT_URL } = require("../constantes");
const bodyParser = require("body-parser");

const { STRIPE_PRIVATE_KEY } = process.env;
const stripe = require("stripe")(STRIPE_PRIVATE_KEY);

module.exports = router;

router.post("/checkout", async (req, res) => {
  const { cart, productId } = req.body;

  if (!cart) {
    try {
      const item = await Product.findByPk(productId);

      let line_item = {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.dataValues.name,
          },
          unit_amount: item.dataValues.price * 100,
        },
        quantity: 1,
      };
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [line_item],
        success_url: `${FRONT_URL}/congrats`,
        cancel_url: `${FRONT_URL}/home/detail/${productId}`,
      });
      return res.json({ url: session.url, sessioId: session });
    } catch (err) {
      return res.status(500).send({ error: err.message });
    }
  }

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
            },
            unit_amount: price.dataValues.price * 100,
          },
          quantity: product.amount,
        };
      })
    );
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: line_items,
      success_url: `${FRONT_URL}/congrats`,
      cancel_url: `${FRONT_URL}/cart`,
    });

    res.json({ url: session.url });
  } catch (err) {
    // console.log(err.message)
    res.status(500).send({ error: err.message });
  }
});

app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  (request, response) => {
    const payload = request.body;
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    response.status(200);
  }
);
