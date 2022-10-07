const { Router } = require("express");
const UserRoutes = require("./UserRoutes.js");
const ProductRoutes = require("./ProductRoutes.js");
const TokenCheck = require("./TokenCheck");
const CategoryRoutes = require("./CategoryRoutes.js");
const ReviewRoutes = require("./ReviewRoutes.js");
const BulkRoutes = require("./BulkRoutes.js");
const FavoriteRoutes = require("./FavoriteRoutes.js");
const OrderRoutes = require("./OrderRoutes");
const CartRoutes = require("./CartRoutes");
const AuthRoutes = require("./AuthRoutes");
const { FRONT_URL } = require("../constantes.js");
const { Product } = require("../db");

//STRIPE
const { STRIPE_PRIVATE_KEY } = process.env;
const stripe = require("stripe")(STRIPE_PRIVATE_KEY);
//STRIPE

const router = Router();

router.get("/", (req, res) => {
  res.send("Back Funcionando");
});

router.post("/checkout", async (req, res) => {
  const { cart, productId } = req.body;

  if (!cart) {
    try {
      const item = await Product.findByPk(productId);

      let line_item = {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.dataValues.name,
          },
          unit_amount: item.dataValues.price * 100,
        },
        quantity: 1,
      };
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [line_item],
        success_url: `${FRONT_URL}/congrats`,
        cancel_url: `${FRONT_URL}/home/detail/${productId}`,
      });
      return res.json({ url: session.url });
    } catch (err) {
      return res.status(500).send({ error: err.message });
    }
  }

  try {
    const line_items = await Promise.all(
      cart.map(async (product) => {
        let price = await Product.findByPk(product.product.id, {
          attributes: ["price"],
        });
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.product.name,
            },
            unit_amount: price.dataValues.price * 100,
          },
          quantity: product.amount,
        };
      })
    );
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: line_items,
      success_url: `${FRONT_URL}/congrats`,
      cancel_url: `${FRONT_URL}/cart`,
    });

    res.json({ url: session.url });
  } catch (err) {
    // console.log(err.message)
    res.status(500).send({ error: err.message });
  }
});

router.use("/user", UserRoutes);
router.use("/product", ProductRoutes);
router.use("/category", CategoryRoutes);
router.use("/review", ReviewRoutes);
router.use("/bulk", BulkRoutes);
router.use("/token", TokenCheck);
router.use("/favorite", FavoriteRoutes);
router.use("/order", OrderRoutes);
router.use("/cart", CartRoutes);
router.use("/auth", AuthRoutes);

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

module.exports = router;
