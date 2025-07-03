'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Cambiar tipo a VARCHAR y permitir NULL
    await queryInterface.sequelize.query(`
      ALTER TABLE "Reviews"
      ALTER COLUMN "product_id" TYPE VARCHAR;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "Reviews"
      ALTER COLUMN "product_id" DROP NOT NULL;
    `);

    // Agregar constraint FK
    await queryInterface.addConstraint('Reviews', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_reviews_product_id',
      references: {
        table: 'Products',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    try {

      await queryInterface.removeConstraint('Reviews', 'fk_reviews_product_id');
    } catch (error) {
      console.error('Error removing foreign key constraint:', error);
    }

    // Volver a INTEGER NOT NULL
    await queryInterface.sequelize.query(`
      ALTER TABLE "Reviews"
      ALTER COLUMN "product_id" TYPE INTEGER USING "product_id"::integer;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "Reviews"
      ALTER COLUMN "product_id" SET NOT NULL;
    `);
  },
};
