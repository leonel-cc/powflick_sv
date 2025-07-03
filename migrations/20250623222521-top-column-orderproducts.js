'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
      await queryInterface.addColumn('OrderProducts', 'top', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('OrderProducts');
    if (table.top) {
      await queryInterface.removeColumn('OrderProducts', 'top');
    }
  },
};
