const { Router } = require('express');
const { Op } = require("sequelize")
const axios = require("axios");
const { User, Cart, Category, Color, Image, Order, Product, Review, conn, ProductCategory} = require('../db'); 


const router = Router();



router.post("/create", async (req, res) => {
    const { name, model, brand, description, thumbnail, price, condition, categories } = req.body;
    // console.log(req.body);   
    try {
        const newProduct = await Product.create({
            name,
            model,
            brand,
            description,
            thumbnail,
            price,
            condition     
    }) 
    if (categories) {
        // console.log(1, newProduct, categories)
        for (let category of categories) {
            // console.log(2, newProduct, category)
            let addCategory = await Category.findOrCreate({where: {name: category}})
            // console.log(3, addCategory[0])
            if (addCategory !== true) await newProduct.addCategory(addCategory[0])
            // console.log(4, newProduct)
        }
    } 
    res.send(newProduct);
} catch (err) {
    // console.log(err);   
    res.status(500).send({error: err.message})
}
});


// Cualquier llamada a esta ruta no puede tener un valor como null
// Puede tener valores que no se manden pero nunca que mandes {key: null}
router.put("/modify", async (req, res) => {
    const { id, name, model, brand, description, thumbnail, price } = req.body;
    // console.log(req.body)
    try { 
        Product.update(
            { name, model, brand, description, thumbnail, price },
            {
                where: {id: id}
            }
        )
        return res.send("Producto modificado");
    } catch(err){
        return res.status(400).send({error: err.message});
    }
});


router.put("/hide", async (req, res) => {
    // console.log(req.body)
    const { id } = req.body;
    try {
        const product = await Product.findByPk(id);
        product.update({hidden: true});
        await product.save();
        res.send("Product hidden");
    } catch (err) {
        res.status(500).send({error: err.message})
    }
});


router.get("/all", async (req, res) => {
    try {
        const products = await Product.findAll({include: [{
            model: Category,
            through: { attributes: [] }
        },
        {
            model: User,
            through: { attributes: [] }
        }
    ]});
        res.send(products)
    } catch (err) {
        res.status(500).send({error: err.message})
    }
});


//Ruta a ser usada para el tema de paginado (sin filtros pero permite ordenar por precio ASC y DESC)

router.get("/itemsPerPage", async (req, res) => {
    let { order, amount, page } = req.query;
    if (!amount) amount = 10;
    try {
        const products = await Product.findAll({
            order: [["price", order ? order : "ASC"]],
            offset: page * amount,
            limit: amount,
            include: [{
                model: Category,
                through: { attributes: [] }
            },
            {
                model: User,
                through: { attributes: [] }
            }
        ]});
        res.send(products)
    } catch (err) {
        res.status(500).send({error: err.message})
    }
});



//Ruta para filtrar (y ordenar por precio ASC y DESC)

router.get("/filterBy", async (req, res) => {
    let { category, brand, model, minPrice, maxPrice, order, amount, page } = req.query;
    if (!page) page = 0; 
    if (!amount) amount = 10;
    if (!brand) brand = "";
    if (!model) model = "";
    if (!minPrice) minPrice = 0;
    if (!maxPrice) maxPrice = 100000000000;
    try {
        const products = await Product.findAll({
            order: [["price", order? order : "ASC"]],
            offset: page * amount,
            limit: amount, 

            where: {
                brand: {[Op.like]: `%${brand}%`},
                model: {[Op.like]: `%${model}%`},
                price: {[Op.between]: [minPrice, maxPrice]}
                // ...(category ? {'$Category.name$': category} : {})
            },
            ...(category ? 
                {include: {
                    // where: (category ? {name : category} : {}),
                    model: Category,
                    through: { attributes: [] },
                    where : {name: category}
                }} : {}
                )
        });
        res.send(products);
    } catch (err) {
        res.status(500).send({error: err.message})
    }
});

router.get("/ID/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByPk(id, {include: {model: Category, through: { attributes: []}}})
        res.send(product)
    } catch (err) {
        res.status(500).send({error: err.message})
    }
});


router.delete("/deleteCategory", async (req, res) => {
    const { id, categoryName } = req.body;
    try {
        const product = await Product.findByPk(id);
        const category = await Category.findByPk(categoryName);
        await product.removeCategory(category);
        res.send("Category removed from product")
    } catch (err) {
        res.status(500).send({error: err.message})
    }
})



// Crear ruta para crear/agregar Producto listo
//     Crear ruta para Modificar Producto listo
//     Crear ruta para ocultar producto listo
//     Crear ruta que devuelva todos los productos listo
//     Crear Ruta que devuelva los productos de X categoria listo
//     Crear ruta de producto individual, pasado un ID que retorne un producto con sus detalles listo


module.exports = router;