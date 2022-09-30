const axios = require("axios");
const { Router } = require('express');
const { User, Cart, Categories, Color, Image, Orders, Products, Reviews, conn} = require('../db') 
const router = Router();

//GET API PRODUCTS

const getApiCellphones = async () => {
    try {
        const apiCel = await axios.get(
            "https://api.mercadolibre.com/sites/MLA/search?category=MLA1055"
        );

        const productsApiCel = apiCel.data.results.map((p)=>(
            {
                name: p.title,
                price: p.price,
                thumbnail: p.thumbnail,
                brand: p.attributes[0].value_name,
                model: p.attributes? p.attributes.filter(a => a.id === "MODEL")[0].values[0].name : "Campo incompleto", 

                description: p.attributes.filter(a => a.id === "PROCESSOR_MODEL")[0] ? p.attributes.filter(a => a.id === "PROCESSOR_MODEL")[0].name + ": " +
                    p.attributes.filter(a => a.id === "PROCESSOR_MODEL")[0].value_name : "Campo incompleto",
                
                condition: p.attributes.filter(a => a.id === "ITEM_CONDITION") && p.attributes.filter(a => a.id === "ITEM_CONDITION")? 
                    p.attributes.filter(a => a.id === "ITEM_CONDITION")[0].value_name : "Campo incompleto",
                    categories: ["celulares"] 
            }
        ));
        await axios.post("https://backpf-production.up.railway.app/bulk/products", {
            "products": productsApiCel
        });
        /* console.log("FINALIZADO CELULARES") */
    } catch (error) {
        console.error(error)
    }
};

const getApiComputers = async () => {
    try {
        const apiComp = await axios.get(
            "https://api.mercadolibre.com/sites/MLA/search?category=MLA1648"
        );

        const productsApiComp = apiComp.data.results.map((p) =>(
            {
                name: p.title,
                price: p.price,
                thumbnail: p.thumbnail,
                brand: p.attributes[0].value_name? p.attributes[0].value_name : "Marca desconocida",
                model: p.attributes? p.attributes.filter(a => a.id === "MODEL")[0].values[0].name : "Campo incompleto", 
                description: p.attributes.filter(a => a.id === "PROCESSOR_MODEL")[0] ? p.attributes.filter(a => a.id === "PROCESSOR_MODEL")[0].name + ": " +
                    p.attributes.filter(a => a.id === "PROCESSOR_MODEL")[0].value_name : "Campo incompleto",
                condition: p.attributes.filter(a => a.id === "ITEM_CONDITION") && p.attributes.filter(a => a.id === "ITEM_CONDITION")? 
                    p.attributes.filter(a => a.id === "ITEM_CONDITION")[0].value_name : "Campo incompleto",
                    categories: ["computadoras"] 
            }
        ));
        await axios.post("https://backpf-production.up.railway.app/bulk/products", {
            "products": productsApiComp
        });
        /* console.log("FINALIZADO CCOMPUTADORAS") */
    } catch (error) {
        console.error(error)
    }
};


module.exports = {
    getApiCellphones,
    getApiComputers
}