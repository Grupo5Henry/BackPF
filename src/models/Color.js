const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    sequelize.define("color", {
        color: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: false
      })

}