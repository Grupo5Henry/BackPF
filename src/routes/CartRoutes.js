const { Router } = require("express");
const { Op } = require("sequelize");
const axios = require("axios");
const {
  User,
  Cart,
  Category,
  Color,
  Image,
  Order,
  Product,
  Favorite,
  Review,
  conn,
  ProductCategory,
} = require("../db");
const router = Router();
module.exports = router;

router.get("/", async (req, res) => {
  const { userName } = req.query;
  if (!userName) return res.send("Missing Username");
  try {
    const cart = await Cart.findAll({
      where: { userName },
      include: Product,
      order: [
        [Product, "price", "ASC"],
        [Product, "name", "ASC"],
      ],
    });
    res.send(cart);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post("/add", async (req, res) => {
  const { userName, productId, amount } = req.body;
  try {
    const cart = await Cart.create({ userName, productId, amount });
    res.send(cart);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.put("/modify", async (req, res) => {
  const { userName, productId, amount } = req.body;
  try {
    if (amount == 0) {
      const relation = await Cart.findOne({ where: { userName, productId } });
      relation.destroy();
      return res.send("Item eliminado");
    }
    await Cart.update(
      { userName, productId, amount },
      {
        where: { userName, productId },
      }
    );
    return res.send("Carrito modificado");
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.delete("/delete", async (req, res) => {
  const { userName, productId } = req.body;
  try {
       await Cart.destroy({ 
        where: {userName, productId} 
      });
    res.send("Eliminated");
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});
