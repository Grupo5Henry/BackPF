const { Router } = require('express');
const { Op } = require("sequelize")
const axios = require("axios");
const { User, Cart, Category, Color, Image, Order, Product, Review, conn, ProductCategory, Favorite} = require('../db'); 
const router = Router();
module.exports = router;



// Ruta:./bulk/users
// Nombre:
// Input
// Descricion:
// Output:


router.post("/users", async (req, res) => {
    const { users } = req.body;

    try {
        // console.log(users)
        await User.bulkCreate(users)
        res.send("Users created")
    } catch (err) {
        res.status(500).send({error: err.message})
    }
});




// Ruta:./bulk/products
// Nombre:
// Input
// Descricion:
// Output:

router.post("/products", async (req, res) => {
    const { products } = req.body;
    try {
        for (let product of products) {
            const { name, model, brand, description, thumbnail, price, condition, categories } = product;
            const newProduct = await Product.findOrCreate({where: {
                name,
                model,
                brand,
                description,
                thumbnail,

                price,
                condition     
            }
            }) 
            if (categories) {
                for (let category of categories) {
                    let addCategory = await Category.findOrCreate({where: {name: category}})
                    //console.log(2, newProduct[0])
                    // console.log(3, addCategory[0])
                    if (addCategory !== true) await newProduct[0].addCategory(addCategory[0])


                }
        }}
        res.send("Products created")
    } catch (err) {
        //console.log(err.message)
        res.status(500).send({error: err.message})
    }
});



// Ruta:./bulk/categories
// Nombre:
// Input
// Descricion:
// Output:


router.post("/categories", async (req, res) => {
    const { categories } = req.body;

    try {
        // console.log(categories)
        await Category.bulkCreate(categories)
        res.send("Categories created")
    } catch (err) {
        res.status(500).send({error: err.message})
    }
});


// Ruta:./bulk/reviews
// Nombre:
// Input
// Descricion:
// Output:


router.post("/reviews", async (req, res) => {
    const { reviews } = req.body;
    try {
        // console.log(1, req.body)
        for (let review of reviews) {
            let { productId, userName, description, stars } = review
            const user = await User.findByPk(userName);
            const product = await Product.findByPk(productId);
            // console.log(2, user, product)
            await user.addProduct(product, { through: { description: description, stars: stars } })
            // console.log(3)
        }
        res.send("Reviews added")
    } catch (err) {
        res.status(500).send({error: err.message})
    }
});






router.post("/randomReviews", async (req, res) => {
    const reviews = [{description: "Pesimo", stars: 1},
    {description: "Un desastre", stars: 1},
    {description: "Empezo a dar problemas al poco tiempo", stars: 2},
    {description: "Mas lento de lo esperado", stars: 2},
    {description: "Cumple", stars: 3},
    {description: "Precio/calidad lo vale", stars: 3},
    {description: "No la recomendaria pero tampoco es tan mala", stars: 3},
    {description: "Tiene algun que otro tema pero funciona bien", stars: 4},
    {description: "Muy buena", stars: 4},
    {description: "A mi hija le sirvio", stars: 4},
    {description: "Excelente", stars: 5},
    {description: "Mejor imposible", stars: 5},
    ]
    // console.log(0)
    const users = await User.findAll({attributes: ["userName"]});
    const products = await Product.findAll({attributes: ["id"]});
    // console.log(1)
    try {
    // console.log(2)
    for (let i = 0; i < 100; i++) {
        let userName = users[Math.floor(Math.random() * users.length)].dataValues.userName;
        let id = products[Math.floor(Math.random() * products.length)].dataValues.id;
        let review = reviews[Math.floor(Math.random() * reviews.length)];
        // console.log(3, userName, id)
        await Review.create({productId: id, userName: userName, ...review})
        // console.log(4)
    }

    res.send("Reviews agregadas")
    } catch (err) {
        res.status(500).send({error: err.message})
    }

})


router.post("/randomFavorite", async (req, res) => {
// console.log(0)
    const users = await User.findAll({attributes: ["userName"]});
    const products = await Product.findAll({attributes: ["id"]});
    // console.log(1)
    try {
    // console.log(2)
    for (let i = 0; i < 100; i++) {
        let userName = users[Math.floor(Math.random() * users.length)].dataValues.userName;
        let id = products[Math.floor(Math.random() * products.length)].dataValues.id;
        // console.log(3, userName, id)
        await Favorite.create({productId: id, userName: userName})
        // console.log(4)
    }

    res.send("Reviews agregadas")
    } catch (err) {
        res.status(500).send({error: err.message})
    }

})