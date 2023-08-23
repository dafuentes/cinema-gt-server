"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Horario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //this.hasMany(models.Sala, { sourceKey: "idSala", foreignKey: "id" });
      this.belongsTo(models.Sala, { foreignKey: "idSala" });
      this.belongsTo(models.Pelicula, { foreignKey: "idPelicula" });
      this.hasMany(models.Venta);
    }
  }
  Horario.init(
    {
      idPelicula: DataTypes.INTEGER,
      idSala: DataTypes.INTEGER,
      startTime: DataTypes.TIME,
      endTime: DataTypes.TIME,
      price: DataTypes.DOUBLE,
      active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Horario",
      tableName: "horarios",
    }
  );
  return Horario;
};
