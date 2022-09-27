const { Router } = require('express');
const { User } = require('../db');
const { Op } = require("sequelize")
const router = Router();
const axios = require("axios");

router.post('/', async (req,res)=>{
    const { role, userName, email, password, defaultShippingAddress, billingAddress } = req.body;
    console.log(req.body);
    try{
        const newUser = await User.create({
            role,
            userName,
            email,
            password,
        defaultShippingAddress,
        billingAddress,
        
        
    })  
    res.send(`User created ${newUser}`);
} catch(err){
    console.log(err);
    res.status(500).send('User cannot be created')
}
})
module.exports = router;