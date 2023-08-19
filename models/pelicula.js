"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Pelicula extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // this.hasOne(models.Horario, { foreignKey: "idPelicula" });
      this.hasMany(models.Horario, { foreignKey: "idPelicula" });
    }
  }
  Pelicula.init(
    {
      movieId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      image: DataTypes.STRING,
      price: DataTypes.DOUBLE,
      startDate: DataTypes.DATEONLY,
      endDate: DataTypes.DATEONLY,
      active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Pelicula",
      tableName: "peliculas",
    }
  );
  return Pelicula;
};
