const { DataTypes } = require('sequelize');
const { sequelize } = require('./config');

const FaceEmbedding = sequelize.define('FaceEmbedding', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  embedding: {
    type: DataTypes.ARRAY(DataTypes.FLOAT),
    allowNull: false,
  },
  imageSize: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'face_embeddings',
  indexes: [
    {
      fields: ['createdAt']
    }
  ]
});

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false }); // Set to true in development to drop and recreate tables
    console.log('✅ Database tables synced successfully');
  } catch (error) {
    console.error('❌ Error syncing database tables:', error);
    throw error;
  }
};

module.exports = {
  FaceEmbedding,
  syncDatabase
};