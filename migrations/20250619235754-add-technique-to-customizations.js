'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Customizations', 'technique', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'Default Sublimated',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Customizations', 'technique');
  },
};
