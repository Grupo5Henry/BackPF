const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    sequelize.define("image", {
        images: {
            type: DataTypes.STRING,
            allowNull: false
        }

    }, {
        timestamps: false
      })

}