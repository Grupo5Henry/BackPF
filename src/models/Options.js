const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    sequelize.define("option", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        attribute1: {
            type: DataTypes.STRING(16)
        },
        attribute2: {
            type: DataTypes.STRING(16)
        },
        attribute3: {
            type: DataTypes.STRING(16)
        },
        attribute4: {
            type: DataTypes.STRING(16)
        },
        attribute5: {
            type: DataTypes.STRING(16)
        },
        attribute6: {
            type: DataTypes.STRING(16)
        },
        attribute7: {
            type: DataTypes.STRING(16)
        },
        attribute8: {
            type: DataTypes.STRING(16)
        },
        attribute9: {
            type: DataTypes.STRING(16)
        },
        price: {
            type: DataTypes.STRING(16),
            allowNull: false
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        images: {
            type: DataTypes.STRING(16),
            allowNull: false
        }

    }, {
        timestamps: false
      })

}