require("dotenv").config();
const { Sequelize, Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const Reviews = require("./models/Reviews");
const { DATABASE_URL } = process.env;

const sequelize = new Sequelize(DATABASE_URL, {
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { Product, Color, Image, Category, Review, User, Order, Cart, Favorite } =
  sequelize.models;

// Aca vendrian las relaciones
// Product.hasMany(Reviews);

Product.belongsToMany(Category, {
  through: "ProductCategory",
  timestamps: false,
});
Category.belongsToMany(Product, {
  through: "ProductCategory",
  timestamps: false,
});

Product.hasMany(Color);
Color.belongsTo(Product);

Product.hasMany(Image);
Image.belongsTo(Product);

//Relaciones muchos a muchos avanzadas

User.belongsToMany(Product, {
  through: Review,
  foreignKey: "userName",
  otherKey: "productId",
});
Product.belongsToMany(User, {
  through: Review,
  foreignKey: "productId",
  otherKey: "userName",
});
Product.hasMany(Review);
Review.belongsTo(Product);

Product.belongsToMany(User, {
  through: Favorite,
  foreignKey: "productId",
  otherKey: "userName",
});
User.belongsToMany(Product, {
  through: Favorite,
  foreignKey: "userName",
  otherKey: "productId",
});
Product.hasMany(Favorite);
Favorite.belongsTo(Product);

User.belongsToMany(Product, {
  through: Cart,
  foreignKey: "productId",
  otherKey: "userName",
});
Product.belongsToMany(User, {
  through: Cart,
  foreignKey: "productId",
  otherKey: "userName",
});
Cart.belongsTo(Product);
Product.hasMany(Cart);

User.belongsToMany(Product, {
  through: {
    model: Order,
    unique: false,
  },
  foreignKey: "productId",
  otherKey: "userName",
});
Product.belongsToMany(User, {
  through: {
    model: Order,
    unique: false,
  },
  foreignKey: "productId",
  otherKey: "userName",
});
Order.belongsTo(Product);
Product.hasMany(Order);

//SuperAdmin:

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
};
