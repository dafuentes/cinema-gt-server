"use strict";
const { DataTypes } = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Venta", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      horarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "horarios",
          key: "id",
        },
      },
      seat: {
        type: Sequelize.INTEGER,
      },
      dateSale: {
        type: Sequelize.DATE,
      },
      dateMovie: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Venta");
  },
};
