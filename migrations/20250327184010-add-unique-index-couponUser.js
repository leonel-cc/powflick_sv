'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('CouponUser', ['user_id', 'coupon_id'], {
      unique: true,
      name: 'unique_user_coupon_index',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('CouponUser', 'unique_user_coupon_index');
  },
};
