const { Router } = require('express');
const router = Router();
const {Order, User, Product} = require('../db')
const { getOrderByOrderNumber, getAllOrders, getGroupOrders } = require('../controllers/controllersOrder');


router.get('/byOrderNumber', async(req, res ) =>{// numero de orden
    const { orderNumber } = req.body;
    const result = await getOrderByOrderNumber(orderNumber);
    res.send(result);
})

router.get('/group', async(req, res) =>{
    try{
        const result = await getGroupOrders()
        res.send(result)
    }catch(error){
        console.log(error)
    }
});

router.get('/', async(req, res) => {
    try{
    const result = await getAllOrders()
    res.send(result)
    }catch (error){
        console.log(error)
    }
})

router.put('/change', async(req, res) =>{
    const { orderNumber , newStatus } = req.body;
    try{
        const result = await Order.findAll({
            where:{
                orderNumber
            }
        })
        result.forEach(element => {
            element.status = newStatus;
            element.save()
        });
        res.send('Elemeto modificado')
    }catch (error){
        console.log(error)
    }
})

router.post('/', async(req, res) =>{
    const{ productId, userName, orderNumber, shippingAddress, status, amount} = req.body
    console.log(req.body)
    try {
        const order = await Order.create({productId, userName, orderNumber, shippingAddress, status, amount})
        res.send(order);
    } catch (error) {
        console.log(error)
    }
});

module.exports = router; 