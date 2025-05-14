'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Eliminar relaciones asociadas a ShoppingCart

    await queryInterface.removeConstraint(
      'Customizations',
      'Customizations_cartProductId_fkey',
    );
    await queryInterface.removeConstraint(
      'CartProduct',
      'CartProduct_product_id_fkey',
    );
    await queryInterface.removeConstraint(
      'CartProduct',
      'CartProduct_cart_id_fkey',
    );

    // Eliminar la tabla CartProduct (tabla intermedia)
    await queryInterface.dropTable('CartProduct');

    // Eliminar la tabla ShoppingCart
    await queryInterface.dropTable('ShoppingCart');
  },

  async down(queryInterface, Sequelize) {
    // Restaurar la tabla ShoppingCart
    await queryInterface.createTable('ShoppingCart', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Restaurar la tabla CartProduct
    await queryInterface.createTable('CartProduct', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      cartId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'ShoppingCart',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      amount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    // // Restaurar columna cartId en la tabla Users
    // await queryInterface.addColumn('Users', 'cartId', {
    //   type: Sequelize.UUID,
    //   references: {
    //     model: 'ShoppingCart',
    //     key: 'id',
    //   },
    //   onDelete: 'CASCADE',
    // });

    // // Restaurar columna shoppingCartId en la tabla Products
    // await queryInterface.addColumn('Products', 'shoppingCartId', {
    //   type: Sequelize.UUID,
    //   references: {
    //     model: 'ShoppingCart',
    //     key: 'id',
    //   },
    //   onDelete: 'CASCADE',
    // });
  },
};
