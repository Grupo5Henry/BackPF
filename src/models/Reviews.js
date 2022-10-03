const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    sequelize.define("review", {
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        stars: {
            type: DataTypes.ENUM("1","2","3","4","5"),
            allowNull: false
        },
        hidden: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: false
      })

}