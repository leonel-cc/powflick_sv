'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('Collections', 'type', {
      type: DataTypes.ENUM('navbar', 'store', 'both'),
      allowNull: false,
      defaultValue: 'store',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Collections', 'type');
  },
};
