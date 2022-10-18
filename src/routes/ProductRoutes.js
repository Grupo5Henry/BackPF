const { Router } = require("express");
const { Op } = require("sequelize");
const axios = require("axios");
const {
  User,
  Cart,
  Category,
  Color,
  Image,
  Order,
  Product,
  Review,
  conn,
  ProductCategory,
} = require("../db");
const {
  getApiCellphones,
  getApiComputers,
} = require("../controllers/controllersApi.js");

const router = Router();

router.post("/create", async (req, res) => {
  const {
    name,
    model,
    brand,
    description,
    thumbnail,
    price,
    condition,
    categories,
    photos,
    stock,
  } = req.body;
  // console.log(req.body);
  try {
    const newProduct = await Product.create({
      name,
      model,
      brand,
      description,
      thumbnail,
      price,
      condition,
      stock,
    });
    if (categories.length /* Si el arreglo tiene algo */) {
      // categories va a ser un array con categorias. En el front va a haber un select con
      // las categorias y se van a ir agregando al arreglo. Si me llegara a faltar una categoria,
      // para eso esta la ruta de categorias.

      await newProduct.setCategories(categories);
    }
    if (photos.length) {
      console.log(photos);
      for (let photo of photos) {
        try {
          console.log(photo);
          newProduct.createImage({ image: photo });
        } catch (err) {
          console.log({ error: err.message });
        }
      }
    }
    res.send(newProduct);
  } catch (err) {
    // console.log(err);
    res.status(500).send({ error: err.message });
  }
});

// Cualquier llamada a esta ruta no puede tener un valor como null
// Puede tener valores que no se manden pero nunca que mandes {key: null}
router.put("/modify", async (req, res) => {
  const {
    id,
    name,
    model,
    brand,
    description,
    thumbnail,
    condition,
    price,
    stock,
    categories,
    photos,
  } = req.body;
  // console.log(req.body)
  try {
    Product.update(
      { name, model, brand, description, thumbnail, condition, price, stock },
      {
        where: { id: id },
      }
    );
    const product = await Product.findByPk(id);

    if (categories.length) {
      await product.setCategories(categories);
    }
    if (photos.length) {
      product.setImages([]);
      for (let photo of photos) {
        try {
          product.createImage({ image: photo });
        } catch (err) {
          console.log({ error: err.message });
        }
      }
    }

    return res.send("Producto modificado");
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
});

router.put("/hide", async (req, res) => {
  // console.log(req.body)
  const { id } = req.body;
  try {
    const product = await Product.findByPk(id);
    product.update({ hidden: true });
    await product.save();
    res.send("Product hidden");
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/Api", async (req, res) => {
  try {
    for (let i = 0; i < 3; i++) {
      await getApiCellphones(i);
      await getApiComputers(i);
    }
    return res.status(200);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/all", async (req, res) => {
  const { admin } = req.body;
  try {
    const products = await Product.findAll({
      ...(admin
        ? {
            include: [
              {
                model: Category,
                through: { attributes: [] },
              },
            ],
          }
        : {
            attributes: ["name"],
            where: { hidden: false, stock: { [Op.gt]: 0 } },
          }),
    });
    res.send(products);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/allBrandAndModel", async (req, res) => {
  try {
    const brands = await Product.findAll({
      attributes: ["brand"],
      group: ["brand"],
      where: { hidden: false },
    });
    const models = await Product.findAll({
      attributes: ["model"],
      group: ["model"],
      where: { hidden: false },
    });
    res.send({ brands, models });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

//Ruta a ser usada para el tema de paginado (sin filtros pero permite ordenar por precio ASC y DESC)
// ASC DESC // amount es la cantidad de productos que queres que te pase // page en que pagina estas
router.get("/itemsPerPage", async (req, res) => {
  let { order, amount, page } = req.query;
  if (!page) page = 0;
  if (!amount) amount = 10;
  try {
    const products = await Product.findAndCountAll({
      where: { hidden: false },
      order: [["price", order ? order : "ASC"]],
      offset: page * amount,
      limit: amount,
      include: [
        {
          model: Category,
          through: { attributes: [] },
        },
        {
          model: User,
          through: { attributes: [] },
        },
      ],
    });
    res.send(products);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

//Ruta para filtrar (y ordenar por precio ASC y DESC)

router.get("/filterBy", async (req, res) => {
  let {
    category,
    brand,
    model,
    minPrice,
    maxPrice,
    search,
    order,
    amount,
    page,
    stock,
  } = req.query;
  // console.log(req.query)
  if (!page) page = 0;
  if (!amount) amount = 10;
  if (!brand) brand = "";
  if (!model) model = "";
  if (!search) search = "";
  if (!minPrice) minPrice = 0;
  if (!maxPrice) maxPrice = 2147483647; // Max integer value
  if (!stock && stock != 0) stock = 0;

  try {
    const products = await Product.findAndCountAll({
      order: [
        ["price", order ? order : "ASC"],
        ["name", "ASC"],
      ],
      offset: page * amount,
      limit: amount,
      where: {
        stock: { [Op.gte]: stock },
        hidden: false,
        brand: { [Op.iLike]: `%${brand}%` },
        model: { [Op.iLike]: `%${model}%` },
        name: { [Op.iLike]: `%${search}%` },
        price: { [Op.between]: [minPrice, maxPrice] },
        // ...(category ? {'$Category.name$': category} : {})
      },
      ...(category
        ? {
            include: {
              // where: (category ? {name : category} : {}),
              model: Category,
              through: { attributes: [] },
              where: { name: { [Op.iLike]: category } },
            },
          }
        : {}),
    });
    res.send(products);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/ID/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id, {
      include: [
        { model: Category, through: { attributes: [] } },
        { model: Image },
      ],
    });
    res.send(product);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/BRAND/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id, {
      include: { model: Category, through: { attributes: [] } },
    });
    // Traer productos con la marca parecida
    const suggested = await Product.findAll({
      where: {
        brand: product.brand,
      },
      limit: 5,
      raw: true,
    });
    res.send({
      suggested,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});
router.delete("/deleteCategory", async (req, res) => {
  const { id, categoryName } = req.body;
  try {
    const product = await Product.findByPk(id);
    const category = await Category.findByPk(categoryName);
    await product.removeCategory(category);
    res.send("Category removed from product");
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/getRecomendedForHome", async (req, res) => {
  try {
    const suggested = await Product.findAll({
      where: { sold: { [Op.gt]: 0 } },
      order: [["sold", "DESC"]],
      limit: 10,
    });
    console.log(suggested);
    res.send(suggested);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Crear ruta para crear/agregar Producto listo
//     Crear ruta para Modificar Producto listo
//     Crear ruta para ocultar producto listo
//     Crear ruta que devuelva todos los productos listo
//     Crear Ruta que devuelva los productos de X categoria listo
//     Crear ruta de producto individual, pasado un ID que retorne un producto con sus detalles listo

module.exports = router;
