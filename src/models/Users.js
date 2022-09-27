const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    sequelize.define("user", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: "User",
            allowNull: false
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        defaultShippingAddress: {
            type: DataTypes.STRING,
            allowNull: false
        },
        billingAddress: {
            type: DataTypes.STRING,
            allowNull: false
        },
        banned: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }

    }, {
        timestamps: false
      })

}