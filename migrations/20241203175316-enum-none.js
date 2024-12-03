'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Collections', 'type', {
      type: Sequelize.ENUM('navbar', 'store', 'both', 'none'),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Collections', 'type', {
      type: Sequelize.ENUM('navbar', 'store', 'both', 'none'),
      allowNull: false,
    });
  },
};
