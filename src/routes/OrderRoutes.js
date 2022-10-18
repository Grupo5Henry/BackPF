const { Router } = require("express");
const router = Router();
const { Order, User, Product } = require("../db");
const {
  getOrderByOrderNumber,
  getAllOrders,
  getGroupOrders,
} = require("../controllers/controllersOrder");
const adminCheck = require("./middleware/adminCheck");

router.get("/byOrderNumber", async (req, res) => {
  // numero de orden
  const { orderNumber } = req.body;
  const result = await getOrderByOrderNumber(orderNumber);
  res.send(result);
});

router.get("/userName", async (req, res) => {
  const { userName } = req.query;
  try {
    const result = await Order.findAll({
      include: { model: Product },
      where: { userName },
      order: [["orderNumber", "ASC"]],
    });
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

router.get("/largestOrderNumber", async (req, res) => {
  try {
    const number = await Order.findAll({
      group: "orderNumber",
      attributes: ["orderNumber"],
      order: [["orderNumber", "DESC"]],
      limit: 1,
    });
    res.send(number);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/", adminCheck, async (req, res) => {
  try {
    const result = await getAllOrders();
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

router.put("/change", async (req, res) => {
  const { orderNumber, newStatus, sessionId } = req.body;
  try {
    const result = await Order.findAll({
      where: {
        orderNumber,
      },
    });
    result.forEach((element) => {
      newStatus ? (element.status = newStatus) : null;
      sessionId ? (element.sessionId = sessionId) : null;
      element.save();
    });
    console.log("aqui");
    res.send("Elemeto modificado");
  } catch (error) {
    console.log(error);
  }
});

router.post("/", async (req, res) => {
  const { productId, userName, orderNumber, shippingAddress, status, amount } =
    req.body;
  // console.log(req.body);
  try {
    const order = await Order.create({
      productId,
      userName,
      orderNumber,
      shippingAddress,
      status,
      amount,
    });
    await Product.increment({ sold: +amount }, { where: { id: productId } });
    res.send(order);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
