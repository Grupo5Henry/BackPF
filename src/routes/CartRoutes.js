const { Router } = require('express');
const { Op } = require("sequelize")
const axios = require("axios");
const { User, Cart, Category, Color, Image, Order, Product, Favorite, Review, conn, ProductCategory} = require('../db'); 
const router = Router();
module.exports = router;



router.get("/", async (req, res) => {
    const { userName } = req.body;
    if (!userName) return res.send("Missing Username")
    try {
        const cart = await Cart.findOne({where: {userName}, include: Product})
        res.send(cart)
    } catch (err) {
        res.status(500).send({error: err.message})
    }
})

router.post("/add", async (req, res) => {
    const { userName, productId, amount } = req.body;
    try {
        const cart = await Cart.create({userName, productId, amount});
        res.send(cart)
    } catch (err) {
        res.status(500).send({error: err.message})
    }
})

router.put("/modify", async (req, res) => {
    const { userName, productId, amount } = req.body;
    try {
        Product.update(
            { userName, productId, amount },
            {
                where: {userName, productId}
            }
        )
        return res.send("Carrito modificado");
    } catch (err) {
        res.status(500).send({error: err.message})
    }
})

router.delete("/delete", async (req, res) => {
    const { userName, productId } = req.body;
    try {
        const cart = await Cart.findOne({userName, productId});
        cart.destroy()
        res.send("Eliminated")
    } catch (err) {
        res.status(500).send({error: err.message})
    }
})