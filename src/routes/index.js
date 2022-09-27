const { Router } = require('express');
// Importar todos los routers;
// // Ejemplo: const authRouter = require('./auth.js');
const userMiddleware = require("./User.js");
const productMiddleware = require("./Product.js")


const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

router.use('/products', productMiddleware);
router.use('/users', userMiddleware);


module.exports = router;
