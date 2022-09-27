const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    sequelize.define("category", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: true
        }

    }, {
        timestamps: false
      })

}