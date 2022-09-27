const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    sequelize.define("cart", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        price: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.amount * 1
            }
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