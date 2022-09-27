const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    sequelize.define("order", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        orderNumber:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        shippingAddress: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        }

    }, {
        timestamps: false
      })

}