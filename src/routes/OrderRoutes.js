const { Router } = require('express');
const router = Router();
const {Order, User, Product} = require('../db')
const { getOrderByDate, getAllOrders, getGroupOrders } = require('../controllers/controllersOrder');


router.get('/parametro/date', async(req, res ) =>{// numero de orden
    const {parametro} = req.body;
    const result = await getOrderByDate(parametro);
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
    const { parametro, newStatus } = req.body;
    try{
        const result = await Order.findAll({
            where:{
                orderNumber : parametro
            }
        })
        result.forEach(element => {
            element.status = newStatus;
            element.save()
        });
        res.send('elemeto modificado')
    }catch (error){
        console.log(error)
    }
})

router.post('/', async(req, res) =>{
    const{ productIdOrder, userNameOrder, shippingAddress, status, amount} = req.body
    try {
        const user = await User.findByPk(userNameOrder);
        const product = await Product.findByPk(productIdOrder);
        await user.addProduct(product, { through: { shippingAddress: shippingAddress, status: status, amount: amount } })
        res.send(product);
    } catch (error) {
        console.log(error)
    }
});

module.exports = router; 