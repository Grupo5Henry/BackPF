const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    sequelize.define("user", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        access: {
            type: DataTypes.STRING,
            defaultValue: "User",
            allowNull: false
        },
        userName: {
            type: DataTypes.STRING(16),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(16),
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(16),
            allowNull: false
        },
        userName: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        defaultShippingAddress: {
            type: DataTypes.STRING(16),
            allowNull: false
        },
        billingAddress: {
            type: DataTypes.STRING(16),
            allowNull: false
        },
        timeOut: {
            type: DataTypes.DATEONLY
        }

    }, {
        timestamps: false
      })

}