"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Venta extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Horario, { foreignKey: "horarioId" });
    }
  }
  Venta.init(
    {
      horarioId: DataTypes.INTEGER,
      seat: DataTypes.INTEGER,
      dateSale: DataTypes.DATE,
      dateMovie: DataTypes.DATEONLY,
    },
    {
      sequelize,
      modelName: "Venta",
      tableName: "venta",
    }
  );
  return Venta;
};
