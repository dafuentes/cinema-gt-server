"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Sala extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Sucursal, { foreignKey: "sucursalId" });
      this.hasMany(models.Horario, { foreignKey: "idSala" });
    }
  }
  Sala.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      price: DataTypes.DOUBLE,
      seats: DataTypes.INTEGER,
      sucursalId: DataTypes.INTEGER,
      active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Sala",
      tableName: "salas",
    }
  );
  return Sala;
};
