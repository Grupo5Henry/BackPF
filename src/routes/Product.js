const { Router } = require('express');
const { Product } = require('../db');
const { Op } = require("sequelize")
const router = Router();
const axios = require("axios");
module.exports = router;



router.get("/", (req, res) => {
    res.send("User")
})
