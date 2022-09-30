require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME} = process.env;

let sequelize = 
    process.env.NODE_ENV === "production"
    ? new Sequelize({
        database:DB_NAME,
        dialect :"postgres",
        host:DB_HOST,
        port:5432,
        username:DB_USER,
        password:DB_PASSWORD,
        pool:{
          max:3,
          min:1,
          idle:10000
        },
        dialectOptions:{
            ssl:{
              require: true,
              rejectUnauthorized: false,
            },
            keepAlive:true,
          },
          ssl: true,
        })
      :new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
          {logging: false, native: false }
      );
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { Product, Color, Image, Category, Review, User, Order, Cart, Favorite } = sequelize.models;

// Aca vendrian las relaciones
// Product.hasMany(Reviews);


Product.belongsToMany(Category, {through: "ProductCategory", timestamps: false})
Category.belongsToMany(Product, {through: "ProductCategory", timestamps: false})

Product.hasMany(Color)
Color.belongsTo(Product)

Product.hasMany(Image)
Image.belongsTo(Product)





//Relaciones muchos a muchos avanzadas

User.belongsToMany(Product, {
  through: Review,
  foreignKey: "userName",
  otherKey: "productId"
} )
Product.belongsToMany(User, {
  through: Review,
  foreignKey: "productId",
  otherKey: "userName"
})




Product.belongsToMany(User, {
  through: Favorite,
  foreignKey: "productId",
  otherKey: "userName"
})
User.belongsToMany(Product, {
  through: Favorite,
  foreignKey: "userName",
  otherKey: "productId"
})
Product.hasMany(Favorite)
Favorite.belongsTo(Product)



User.belongsToMany(Product, {
  through: Cart,
  foreignKey: "productId",
  otherKey: "userName"
})
Product.belongsToMany(User, {
  through: Cart,
  foreignKey: "productId",

  otherKey: "userName"  
})



User.belongsToMany(Product, {
  through: Order,
  foreignKey: "productId",
  otherKey: "userName"
})
Product.belongsToMany(User, {
  through: Order,
  foreignKey: "productId",
  otherKey: "userName"

})



module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
};
