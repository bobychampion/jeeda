/**
 * Script to update "Garage" category to "Storage Room"
 * Run with: node src/scripts/updateGarageToStorage.js
 */

import { db } from '../config/firebaseAdmin.js';
import { Timestamp } from 'firebase-admin/firestore';

async function updateGarageToStorage() {
  try {
    console.log('Updating "Garage" category to "Storage Room"...');
    
    const categoriesRef = db.collection('categories');
    const snapshot = await categoriesRef.where('name', '==', 'Garage').get();
    
    if (snapshot.empty) {
      console.log('No "Garage" category found. It may have already been updated or doesn\'t exist.');
      
      // Check if Storage Room already exists
      const storageSnapshot = await categoriesRef.where('name', '==', 'Storage Room').get();
      if (!storageSnapshot.empty) {
        console.log('"Storage Room" category already exists.');
      } else {
        console.log('Creating "Storage Room" category...');
        await categoriesRef.add({
          name: 'Storage Room',
          description: 'Storage room organization including storage cabinets, shelving systems, and organization solutions.',
          imageUrl: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&q=80',
          order: 11,
          hidden: false,
          aiAllowed: true,
          type: 'room',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        console.log('✓ Created "Storage Room" category');
      }
      return;
    }
    
    // Update each Garage category found
    const updatePromises = snapshot.docs.map(async (doc) => {
      await doc.ref.update({
        name: 'Storage Room',
        description: 'Storage room organization including storage cabinets, shelving systems, and organization solutions.',
        updatedAt: Timestamp.now(),
      });
      console.log(`✓ Updated category "${doc.id}" from "Garage" to "Storage Room"`);
    });
    
    await Promise.all(updatePromises);
    console.log(`\n✅ Complete! Updated ${snapshot.size} category/categories.`);
  } catch (error) {
    console.error('Error updating category:', error);
    process.exit(1);
  }
}

updateGarageToStorage()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

