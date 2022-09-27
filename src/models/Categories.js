const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    sequelize.define("category", {
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
        icon: {
            type: DataTypes.STRING(16),
            allowNull: true
        }

    }, {
        timestamps: false
      })

}