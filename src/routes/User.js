const { Router } = require('express');
const { User } = require('../db');
const { Op } = require("sequelize")
const router = Router();
const axios = require("axios");
module.exports = router;



router.get("/", (req, res) => {
    res.send("Product")
})

