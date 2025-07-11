'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla Influencers con id UUID
    await queryInterface.createTable('Influencers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
      },
      label: {
        unique: true, // <- esta línea garantiza unicidad
        type: Sequelize.STRING,
      },
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      logo: {
        type: Sequelize.STRING,
      },
      banner: {
        type: Sequelize.STRING,
      },
      profileImage: {
        type: Sequelize.STRING, // Nueva columna para la imagen de perfil
      },
      socialMedia: {
        type: Sequelize.JSON, // Nueva columna para redes sociales
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // Agregar columna influencer_id UUID a Products
    await queryInterface.addColumn('Products', 'influencer_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Influencers',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'influencer_id');
    await queryInterface.dropTable('Influencers');
  },
};
