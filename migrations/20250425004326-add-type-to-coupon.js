'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Coupon', 'type', {
      type: Sequelize.ENUM('percent', 'amount'),
      allowNull: false,
      defaultValue: 'percent',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Coupon', 'type');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Coupon_type";',
    );
  },
};
