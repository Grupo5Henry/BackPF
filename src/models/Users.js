const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    sequelize.define("user", {
        role: {
            type: DataTypes.STRING,
            defaultValue: "user",
            allowNull: false
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true
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