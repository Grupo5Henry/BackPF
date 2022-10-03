const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    sequelize.define("user", {
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: "user"
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