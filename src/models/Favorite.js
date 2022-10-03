const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    sequelize.define("favorite", {
        
    }, {
        timestamps: false
      })

}