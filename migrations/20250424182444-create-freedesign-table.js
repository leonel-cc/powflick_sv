'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FreeDesigns', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      teamName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sport: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      color: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      date: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      primaryColors: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      secondaryColors: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      font: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      addNames: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      addNumbers: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      logos: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      otherImages: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      organization: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Teams');
  },
};
