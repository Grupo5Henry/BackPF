const { Router } = require('express');
const { Product } = require('../db');
const { Op } = require("sequelize")
const axios = require("axios");
const { User, Cart, Categories, Color, Image, Orders, Products, Reviews, conn} = require('../db') 


const router = Router();


router.post('/',async (req,res)=>{
const { access, userName, email, password, defaultShippingAddress, billingAddress } = req.body;
console.log(req.body);
try{
    const newUser = await User.create({
        access,
        userName,
        email,
        password,
        defaultShippingAddress,
        billingAddress,
    
    
})  
res.send('User created', newUser);
} catch(err){
    console.log(err);
    res.status(500).send('User cannot be created')
}
})
module.exports = router;