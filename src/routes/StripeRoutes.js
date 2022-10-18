const { Router } = require("express");
const { User, Product } = require("../db");

const router = Router();

const { BACK_URL, FRONT_URL } = require("../constantes");
const bodyParser = require("body-parser");
const { default: axios } = require("axios");

const { STRIPE_PRIVATE_KEY } = process.env;
const stripe = require("stripe")(STRIPE_PRIVATE_KEY);
const { endpointSecret } = process.env;

module.exports = router;

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

    if (session.payment_status === "paid") {
      // Fulfill the purchase...

      await fulfillOrder(session);
    }
  }
  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
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
