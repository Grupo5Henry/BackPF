const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "image",
    {
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
};
