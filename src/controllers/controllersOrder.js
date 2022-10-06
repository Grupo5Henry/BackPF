const { fn, Sequelize } = require("sequelize");
const { Order,  User } = require("../db");

const getAllOrders = async() =>{
    const data = await Order.findAll()
    return data;
}

const getGroupOrders = async() =>{
    const orders = await Order.findAll({
        group : 'orderNumber',
        attributes: ["orderNumber", fn('array_agg', Sequelize.col('userName'), Sequelize.col('productId'),  Sequelize.col('amount')),]
    })
    return orders;
}

const getOrderByOrderNumber = async (parametro) =>{
    const data = await Order.findAll({
        where : {
            orderNumber : parametro
        }})
    return data;
}
module.exports = {
    getAllOrders,
    getGroupOrders,
    getOrderByOrderNumber,
}