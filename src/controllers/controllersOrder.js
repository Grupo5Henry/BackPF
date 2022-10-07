const { Sequelize, fn } = require("sequelize");
const { Order, User, Product } = require("../db");

const getAllOrders = async () => {
  const data = await Order.findAll({
    include: {
      model: Product,
    },
  });
  return data;
};

// const getGroupOrders = async() =>{
//     const orders = await Order.findAll({
//         group : 'orderNumber',
//         attributes: ["orderNumber", fn('array_agg', fn("json_agg", Sequelize.col('productId'), Sequelize.col('amount')))]
//     })
//     return orders;
// }

const getOrderByOrderNumber = async (parametro) => {
  const data = await Order.findAll({
    where: {
      orderNumber: parametro,
    },
  });
  return data;
};
module.exports = {
  getAllOrders,
  getOrderByOrderNumber,
};
