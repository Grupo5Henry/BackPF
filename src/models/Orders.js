const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    sequelize.define("order", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        shippingAddress: {
            type: DataTypes.STRING(16),
            allowNull: false
        },
        status: {
            type: DataTypes.STRING(16),
            allowNull: true
        },
        price: {
            type: DataTypes.VIRTUAL
        },
        productId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        }

    }, {
        timestamps: false
      })

}