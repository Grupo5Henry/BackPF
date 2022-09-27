const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    sequelize.define("product", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(16),
            allowNull: false
        },
        model: {
            type: DataTypes.STRING(16),
            allowNull: false
        },
        brand: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        thumbnail: {
            type: DataTypes.STRING(16),
            allowNull: false
        }
    }, {
        timestamps: false
      })

}