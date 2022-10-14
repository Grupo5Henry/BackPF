const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "image",
    {
      image: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
};
