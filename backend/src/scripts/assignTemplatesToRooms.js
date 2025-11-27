/**
 * Script to randomly assign existing templates to room categories
 * Run with: node src/scripts/assignTemplatesToRooms.js
 */

import { db } from '../config/firebaseAdmin.js';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Randomly assign templates to room categories
 * @param {boolean} dryRun - If true, only show what would be changed without updating
 */
async function assignTemplatesToRooms(dryRun = false) {
  try {
    console.log('🔄 Starting template assignment to room categories...');
    if (dryRun) {
      console.log('⚠️  DRY RUN MODE - No changes will be made\n');
    }

    // Fetch all room categories
    console.log('📋 Fetching room categories...');
    const categoriesSnapshot = await db.collection('categories')
      .where('type', '==', 'room')
      .get();
    
    if (categoriesSnapshot.empty) {
      console.error('❌ No room categories found! Please run addRoomCategories.js first.');
      process.exit(1);
    }

    const roomCategories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    }));

    console.log(`✓ Found ${roomCategories.length} room categories:`);
    roomCategories.forEach(cat => console.log(`   - ${cat.name}`));
    console.log('');

    // Fetch all templates
    console.log('📦 Fetching all templates...');
    const templatesSnapshot = await db.collection('templates').get();
    
    if (templatesSnapshot.empty) {
      console.log('⚠️  No templates found in database.');
      process.exit(0);
    }

    const templates = templatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✓ Found ${templates.length} templates\n`);

    // Randomly assign each template to a room category
    const categoryNames = roomCategories.map(cat => cat.name);
    let updated = 0;
    let skipped = 0;
    const assignments = {};

    // Initialize assignment counter
    categoryNames.forEach(name => {
      assignments[name] = 0;
    });

    console.log('🎲 Randomly assigning templates to room categories...\n');

    for (const template of templates) {
      // Skip if template already has a valid room category
      const hasValidRoomCategory = categoryNames.includes(template.category);
      
      if (hasValidRoomCategory && !dryRun) {
        console.log(`⏭️  Skipping "${template.name}" - already assigned to "${template.category}"`);
        skipped++;
        assignments[template.category]++;
        continue;
      }

      // Randomly select a room category
      const randomIndex = Math.floor(Math.random() * categoryNames.length);
      const selectedCategory = categoryNames[randomIndex];

      if (dryRun) {
        console.log(`📝 Would assign "${template.name}" (current: "${template.category || 'none'}") → "${selectedCategory}"`);
        assignments[selectedCategory]++;
      } else {
        // Update template
        await db.collection('templates').doc(template.id).update({
          category: selectedCategory,
          updatedAt: Timestamp.now(),
        });
        
        console.log(`✓ Assigned "${template.name}" → "${selectedCategory}"`);
        assignments[selectedCategory]++;
        updated++;
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Assignment Summary:');
    console.log('='.repeat(50));
    
    if (!dryRun) {
      console.log(`✅ Updated: ${updated} templates`);
      console.log(`⏭️  Skipped: ${skipped} templates (already had valid room category)`);
    } else {
      console.log(`📝 Would update: ${templates.length} templates`);
    }
    
    console.log('\n📈 Distribution by room category:');
    Object.entries(assignments)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        const bar = '█'.repeat(Math.floor(count / 2));
        console.log(`   ${category.padEnd(20)} ${count.toString().padStart(3)} ${bar}`);
      });

    console.log('\n✅ Script completed successfully!');
    
    if (dryRun) {
      console.log('\n💡 To apply these changes, run without --dry-run flag');
    }
  } catch (error) {
    console.error('❌ Error assigning templates:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-d');

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.endsWith('assignTemplatesToRooms.js');

if (isMainModule || process.argv[1]?.includes('assignTemplatesToRooms')) {
  assignTemplatesToRooms(dryRun)
    .then(() => {
      console.log('\n🎉 All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script error:', error);
      process.exit(1);
    });
}

export { assignTemplatesToRooms };

