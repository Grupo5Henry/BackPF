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
  const { line_items } = session;
  const { orderNumber } = session.metadata;
  try {
    axios.put(`${BACK_URL}/order/change`, {
      orderNumber,
      newStatus: "PaidPendingDelivery",
    });
  } catch (err) {
    console.log({ error: err.message });
  }
  for (let product of cart) {
    try {
      //   await Product.update(
      //     {
      //       stock: product.amount,
      //     },
      //     { where: { id: product.id } }
      //   );
      console.log(product);
      console.log(product.price_data, "priceData");
      console.log(product.price_data.product_data, "productData");
      console.log(product.price_data.product_data.metada.id, "productId");
    } catch (err) {
      console.log({ error: err.message });
    }
  }
};

const cancelOrder = async (session) => {
  const { orderNumber, cart } = session.metadata;
  try {
    axios.put(`${BACK_URL}/order/change`, {
      orderNumber,
      newStatus: "Cancelled",
    });
  } catch (err) {
    console.log({ error: err.message });
  }
  for (let product of cart) {
    try {
      await Product.update(
        {
          stock: +product.amount,
        },
        { where: { id: product.id } }
      );
    } catch (err) {
      console.log({ error: err.message });
    }
  }
};

router.post("/checkout", async (req, res) => {
  const { cart, productId, orderNumber, userName } = req.body;

  //   if (!cart) {
  //     try {
  //       const item = await Product.findByPk(productId);

  //       let line_item = {
  //         price_data: {
  //           currency: "usd",
  //           product_data: {
  //             name: item.dataValues.name,
  //           },
  //           unit_amount: item.dataValues.price * 100,
  //         },
  //         quantity: 1,
  //       };
  //       const session = await stripe.checkout.sessions.create({
  //         payment_method_types: ["card"],
  //         mode: "payment",
  //         line_items: [line_item],
  //         success_url: `${FRONT_URL}/congrats?success=true`,
  //         cancel_url: `${FRONT_URL}/home/detail/${productId}`,
  //       });

  //       return res.json({ url: session.url, sessioId: session });
  //     } catch (err) {
  //       return res.status(500).send({ error: err.message });
  //     }
  //   }

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
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: line_items,
      success_url: `${FRONT_URL}/congrats?success=true`,
      cancel_url: `${FRONT_URL}/cart`,
      metadata: { orderNumber, userName },
    });
    // console.log(session.url);
    try {
      axios.put(`${BACK_URL}/order/change`, {
        orderNumber,
        url: session.url,
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
    } else {
      cancelOrder(session);
    }
  }

  response.status(200);
});
