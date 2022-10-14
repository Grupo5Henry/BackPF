const server = require("./src/app.js");
const { conn } = require("./src/db.js");
const { PORT } = process.env;
const bcrypt = require("bcrypt");

// Syncing all the models at once.

conn
  .sync({ force: false })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`%s listening at ${PORT}`); // eslint-disable-line no-console
    });
  })
  .then(() => {
    superAdmin("123");
  });

const superAdmin = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  await conn.models.User.findOrCreate({
    where: { userName: "owner" },
    defaults: {
      role: "admin",
      userName: "owner",
      email: "null@null.null",
      password: hashedPassword,
      defaultShippingAddress: "none",
      billingAddress: "none",
      verified: true,
    },
  });
};
