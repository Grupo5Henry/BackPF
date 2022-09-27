const { Router } = require('express');
// Importar todos los routers;
// // Ejemplo: const authRouter = require('./auth.js');
// const countryMiddleware = require("./Country.js");
// const activityMiddleware = require("./Activity.js")


const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

// router.use('/countries', countryMiddleware);
// router.use('/activities', activityMiddleware);

router.get("/", (req, res) => {
    res.send("Levantado")
})
module.exports = router;
