const { Router } = require('express');
const { conn, Category } = require('../db');
const { Op } = require("sequelize")
const router = Router();
const axios = require("axios");
module.exports = router;



router.get("/", async(req, res) => {
    try {
        res.send(await Category.findAll())
    } catch (error) {
        res.send(error.message)
    }
})

router.put("/:name",async(req,res) => {
    try {
        // me pasan el name de la categoria a modificar por params, y por body un obj con {name,icon}
        // con la info actualizada
        var {name} = req.params
        await Category.update(req.body,{
            where: {
                name 
            }
        })
        res.send("Category update")
    } catch (error) {
        res.send(error.message)
    }
})

router.post("/",async(req,res) => {
    try {
        // req.body es {name: "...", icon: "..."} o solamente {name: "..."}
        // el create recibe un obj como parametro y en vez de hacer destructuring se lo paso al
        // req.body de una
        await Category.create(req.body)
        res.send("Category created")
    } catch (error) {
        res.send(error.message)
    }
})

router.post("/product",async(req,res) => {
    try {
        var {arrProductsIDs,name_category} = req.body
        // recibo un arreglo con los ids de los procuctos que le quiero agregar a la categoria
        var category = await Category.findByPk(name_category)
        await category.setProducts(arrProductsIDs)
        res.send(`${category.name} was associated to some products`)
    } catch (error) {
        res.send(error.message)
    }
})

