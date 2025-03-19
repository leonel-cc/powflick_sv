'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('Products');

    if (!tableDesc.product_collections) {
      await queryInterface.addColumn('Products', 'product_collections', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!tableDesc.product_tags) {
      await queryInterface.addColumn('Products', 'product_tags', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!tableDesc.score) {
      await queryInterface.addColumn('Products', 'score', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true,
      });
    }
    await queryInterface.changeColumn('Collections', 'content', {
      type: Sequelize.STRING,
      allowNull: true,  // Permitir valores nulos
    });

    // Crear la tabla 'TAGS' (respetando el nombre en mayúsculas)
    await queryInterface.createTable('TAGS', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      }
    });

    // Crear la tabla 'product_tags' con clave primaria UUID
    await queryInterface.createTable('product_tags', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      productId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tagId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'TAGS',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar la tabla intermedia 'product_tags'
    await queryInterface.dropTable('product_tags');

    // Eliminar la tabla 'TAGS'
    await queryInterface.dropTable('TAGS');

    // Eliminar la columna 'score' de la tabla 'Products'
    await queryInterface.removeColumn('Products', 'score');

    await queryInterface.changeColumn('Collections', 'content', {
      type: Sequelize.STRING,
      allowNull: false,  // Restaurar configuración anterior si se revierte la migración
    });
  }
};
