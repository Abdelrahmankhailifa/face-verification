const fs = require('fs');
const path = require('path');

console.log('📁 ORGANIZING YOUR IMAGES PROPERLY\n');
console.log('='.repeat(60));

const images = fs.readdirSync('./test_images')
  .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
  .map(f => path.join('./test_images', f));

console.log(`Found ${images.length} images:\n`);

// Manual categorization based on filenames
const categories = {
  noFace: [],
  animalFaces: [],
  humanFaces: [],
  multipleFaces: []
};

images.forEach(img => {
  const filename = path.basename(img).toLowerCase();
  
  if (filename.includes('black') || filename.includes('pattern')) {
    categories.noFace.push(img);
    console.log(`❌ NO FACE: ${filename}`);
  } 
  else if (filename.includes('lion')) {
    categories.animalFaces.push(img);
    console.log(`🐯 ANIMAL FACE: ${filename}`);
  }
  else if (filename.includes('multiple')) {
    categories.multipleFaces.push(img);
    console.log(`👥 MULTIPLE FACES: ${filename}`);
  }
  else if (filename.includes('person1')) {
    categories.humanFaces.push(img);
    console.log(`👤 PERSON 1: ${filename}`);
  }
  else if (filename.includes('person2')) {
    categories.humanFaces.push(img);
    console.log(`👤 PERSON 2: ${filename}`);
  }
  else if (filename.includes('person3')) {
    categories.humanFaces.push(img);
    console.log(`👤 PERSON 3: ${filename}`);
  }
  else {
    categories.humanFaces.push(img);
    console.log(`👤 HUMAN FACE: ${filename}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 FINAL ORGANIZATION:');
console.log(`   👤 Human Faces: ${categories.humanFaces.length} images`);
categories.humanFaces.forEach(img => console.log(`      - ${path.basename(img)}`));

console.log(`   👥 Multiple Faces: ${categories.multipleFaces.length} images`);
categories.multipleFaces.forEach(img => console.log(`      - ${path.basename(img)}`));

console.log(`   🐯 Animal Faces: ${categories.animalFaces.length} images`);
categories.animalFaces.forEach(img => console.log(`      - ${path.basename(img)}`));

console.log(`   ❌ No Faces: ${categories.noFace.length} images`);
categories.noFace.forEach(img => console.log(`      - ${path.basename(img)}`));

console.log('\n💡 RECOMMENDED TESTING:');
if (categories.humanFaces.length >= 3) {
  console.log('   ✅ Perfect! You have 3 different people for testing:');
  console.log(`      Person 1: ${path.basename(categories.humanFaces[0])}`);
  console.log(`      Person 2: ${path.basename(categories.humanFaces[1])}`);
  console.log(`      Person 3: ${path.basename(categories.humanFaces[2])}`);
}

if (categories.multipleFaces.length > 0) {
  console.log('   ✅ Multiple faces image available for Test Case 5');
}

if (categories.noFace.length > 0) {
  console.log('   ✅ No-face images available for Test Case 4');
}

if (categories.animalFaces.length > 0) {
  console.log('   🐯 Animal face available - will test how system handles non-human faces');
}