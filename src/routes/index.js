const { Router } = require('express');
const { Users, Cart, Categories, Color, Image, Orders, Products, Reviews, conn} = require('../db') 
// Importar todos los routers;
// // Ejemplo: const authRouter = require('./auth.js');
// const countryMiddleware = require("./Country.js");
// const activityMiddleware = require("./Activity.js")


const router = Router();


router.post('/users',async (req,res)=>{
  const { access, userName, email, password, defaultShippingAddress, billingAddress, status } = req.body;
  
  try{
    const newUser = await Users.create({
      access,
      userName,
      email,
      password,
      defaultShippingAddress,
      billingAddress,
      status

    })  
    res.send('User created');
  } catch(err){
    console.log(err);
    res.status(500).send('User cannot be created')
  }
})

/* 
    RUTAS USUARIOS
    Crear Ruta para creación de Usuario  
    Crear Ruta para traer usuarios
    Crear Ruta para modificar Usuario
    Crear Ruta para eliminar usuario
    Crear Ruta que retorne todas las Ordenes de los usuarios agregar relacion

    PRODUCTOS / CATEGORIAS

    Crear ruta para crear/agregar Categoria
    Crear ruta para mostrar todas las categorias
    Crear ruta para asociar categorias de un producto
    Crear ruta para sacar categorias de un producto
    Crear ruta para Modificar Categoria

    Crear ruta para crear/agregar Producto
    Crear ruta para Modificar Producto
    Crear ruta para ocultar producto
    Crear ruta que devuelva todos los productos
    Crear Ruta que devuelva los productos de X categoria
    Crear ruta de producto individual, pasado un ID que retorne un producto con sus detalles

    REVIEW
    Crear ruta para crear/agregar Review
    Crear Ruta para obtener todas las reviews de un producto.
    Crear ruta para Modificar Review
    Crear Ruta para eliminar Review

    Crear ruta que retorne todas las ordenes
    Crear Ruta que retorne una orden en particular
    Crear Ruta para modificar una Orden


    */



// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

// router.use('/countries', countryMiddleware);
// router.use('/activities', activityMiddleware);


module.exports = router;
