// check-database.js
const { sequelize } = require('./database/config');
const { FaceEmbedding } = require('./database/models');

async function checkDatabase() {
  try {
    console.log('🔍 Checking PostgreSQL Database...\n');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Count records
    const count = await FaceEmbedding.count();
    console.log(`📊 Total embeddings stored: ${count}`);
    
    if (count > 0) {
      // Show recent records
      const recent = await FaceEmbedding.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'originalName', 'imageSize', 'createdAt']
      });
      
      console.log('\n📝 Recent embeddings:');
      recent.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.originalName} (${record.imageSize})`);
        console.log(`      ID: ${record.id}`);
        console.log(`      Date: ${record.createdAt}`);
      });
      
      // Show that embeddings are actually stored as arrays
      const sample = await FaceEmbedding.findOne({
        attributes: ['id', 'embedding']
      });
      
      if (sample) {
        console.log(`\n🔢 Sample embedding dimensions: ${sample.embedding.length}`);
        console.log(`   First 5 values: [${sample.embedding.slice(0, 5).join(', ')}]`);
      }
    }
    
    console.log('\n✅ PostgreSQL storage is working correctly!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();