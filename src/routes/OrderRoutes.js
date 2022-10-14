const { Router } = require("express");
const router = Router();
const { Order, User, Product } = require("../db");
const {
  getOrderByOrderNumber,
  getAllOrders,
  getGroupOrders,
} = require("../controllers/controllersOrder");

router.get("/byOrderNumber", async (req, res) => {
  // numero de orden
  const { orderNumber } = req.body;
  const result = await getOrderByOrderNumber(orderNumber);
  res.send(result);
});

// router.get('/group', async(req, res) =>{
//     try{
//         const result = await getGroupOrders()
//         res.send(result)
//     }catch(error){
//         console.log(error)
//     }
// });

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

router.get("/", async (req, res) => {
  try {
    const result = await getAllOrders();
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

router.put("/change", async (req, res) => {
  const { orderNumber, newStatus, url } = req.body;
  try {
    const result = await Order.findAll({
      where: {
        orderNumber,
      },
    });
    result.forEach((element) => {
      newStatus ? (element.status = newStatus) : null;
      url ? (element.url = url) : null;
      element.save();
    });
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
    res.send(order);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
