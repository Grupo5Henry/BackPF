const { Router } = require('express');
const { Product } = require('../db');
const { Op } = require("sequelize")
const axios = require("axios");
const { User, Cart, Categories, Color, Image, Orders, Products, Reviews, conn} = require('../db') 


const router = Router();


module.exports = router;