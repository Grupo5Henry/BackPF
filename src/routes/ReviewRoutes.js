const { Router } = require('express');
const { Op } = require("sequelize")
const axios = require("axios");
const { User, Cart, Category, Color, Image, Order, Product, Review, conn, ProductCategory} = require('../db'); 
const router = Router();
module.exports = router;



router.post("/add", async (req, res) => {
    const { productId, userName, description, stars } = req.body;
    try {

        //console.log(1, req.body)
        const user = await User.findByPk(userName);
        const product = await Product.findByPk(productId);
        //console.log(2, user, product)
        await user.addProduct(product, { through: { description: description, stars: stars } })
        //console.log(3)

        res.send("Review added")
    } catch (err) {
        res.status(500).send({error: err.message})
    }
});


router.get("/ID/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const reviews = await Review.findAll({ where: { productId: id}})
        res.send(reviews);
    } catch (err) {
        res.status(500).send({error: err.message})
    }
})

router.get("/all", async (req, res) => {
    try {
        const reviews = await Review.findAll();
        res.send(reviews)
    } catch (err) {
        res.status(500).send({error: err.message})
    }
})


router.put("/modify", async (req, res) => {
    const { productId, userName, description, stars } = req.body;
    // console.log(req.body)
    try { 
        Review.update(
            { userName, productId, description, stars},
            {
                where: {productId: productId, userName: userName}
            }
        )
        return res.send("Review modificada");
    } catch(err){
        return res.status(400).send({error: err.message});
    }
});


router.put("/hideReview", async (req, res) => {
    const { productId, userName } = req.body;
    try {
        const review = await Review.findOne({where: { productId: productId, userName: userName}});
        review.update({hidden: true});
        await review.save();
        res.send("Review hidden");
    } catch (err) {
        res.status(500).send({error: err.message})
    }
})






// Crear ruta para crear/agregar Review listo
// Crear Ruta para obtener todas las reviews de un producto. listo
// Crear ruta para Modificar Review listo
// Crear Ruta para ocultar review listo