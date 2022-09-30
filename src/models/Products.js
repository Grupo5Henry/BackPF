const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    sequelize.define("product", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false
        },
        brand: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING
        },
        thumbnail: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        hidden: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        condition: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: false
      })

}