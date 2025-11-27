/**
 * Script to add room-based categories to Firestore
 * Run with: node src/scripts/addRoomCategories.js
 */

import { db } from '../config/firebaseAdmin.js';
import { Timestamp } from 'firebase-admin/firestore';

const roomCategories = [
  {
    name: 'Living Room',
    description: 'Furniture and decor for your living room, including sofas, coffee tables, TV consoles, and entertainment centers.',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    order: 1,
    hidden: false,
    aiAllowed: true,
    type: 'room', // New field to distinguish room categories
  },
  {
    name: 'Bedroom',
    description: 'Bedroom furniture including beds, nightstands, dressers, wardrobes, and bedroom storage solutions.',
    imageUrl: 'https://images.unsplash.com/photo-1631889993954-0d8b9753c88e?w=800&q=80',
    order: 2,
    hidden: false,
    aiAllowed: true,
    type: 'room',
  },
  {
    name: 'Kitchen',
    description: 'Kitchen furniture and storage including kitchen islands, pantry organizers, and dining furniture.',
    imageUrl: 'https://images.unsplash.com/photo-1556912172-45b7cc8d6aef?w=800&q=80',
    order: 3,
    hidden: false,
    aiAllowed: true,
    type: 'room',
  },
  {
    name: 'Office',
    description: 'Home office furniture including desks, bookshelves, filing cabinets, and workspace organizers.',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    order: 4,
    hidden: false,
    aiAllowed: true,
    type: 'room',
  },
  {
    name: 'Kids Room',
    description: 'Furniture designed for children\'s rooms including kids\' beds, toy storage, study desks, and playroom furniture.',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
    order: 5,
    hidden: false,
    aiAllowed: true,
    type: 'room',
  },
  {
    name: 'Bathroom',
    description: 'Bathroom storage and organization including vanity organizers, towel racks, and bathroom shelving.',
    imageUrl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80',
    order: 6,
    hidden: false,
    aiAllowed: true,
    type: 'room',
  },
  {
    name: 'Laundry Room',
    description: 'Laundry room organization including storage cabinets, folding stations, and laundry organizers.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    order: 7,
    hidden: false,
    aiAllowed: true,
    type: 'room',
  },
  {
    name: 'Dining Room',
    description: 'Dining room furniture including dining tables, chairs, sideboards, and dining storage.',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80',
    order: 8,
    hidden: false,
    aiAllowed: true,
    type: 'room',
  },
  {
    name: 'Entryway',
    description: 'Entryway furniture including console tables, coat racks, shoe storage, and entry organizers.',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    order: 9,
    hidden: false,
    aiAllowed: true,
    type: 'room',
  },
  {
    name: 'Outdoor',
    description: 'Outdoor furniture including patio tables, garden storage, outdoor seating, and deck furniture.',
    imageUrl: 'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?w=800&q=80',
    order: 10,
    hidden: false,
    aiAllowed: true,
    type: 'room',
  },
  {
    name: 'Storage Room',
    description: 'Storage room organization including storage cabinets, shelving systems, and organization solutions.',
    imageUrl: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&q=80',
    order: 11,
    hidden: false,
    aiAllowed: true,
    type: 'room',
  },
  {
    name: 'Basement',
    description: 'Basement furniture and storage solutions for finished basements and storage areas.',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    order: 12,
    hidden: false,
    aiAllowed: true,
    type: 'room',
  },
];

async function addRoomCategories() {
  try {
    console.log('Adding room categories to Firestore...');
    
    const categoriesRef = db.collection('categories');
    
    // Check existing categories to avoid duplicates
    const existingSnapshot = await categoriesRef.get();
    const existingNames = new Set(existingSnapshot.docs.map(doc => doc.data().name));
    
    let added = 0;
    let skipped = 0;
    
    for (const category of roomCategories) {
      if (existingNames.has(category.name)) {
        console.log(`Skipping "${category.name}" - already exists`);
        skipped++;
        continue;
      }
      
      await categoriesRef.add({
        ...category,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log(`✓ Added "${category.name}"`);
      added++;
    }
    
    console.log(`\n✅ Complete! Added ${added} categories, skipped ${skipped} existing categories.`);
  } catch (error) {
    console.error('Error adding room categories:', error);
    process.exit(1);
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.endsWith('addRoomCategories.js');

if (isMainModule || process.argv[1]?.includes('addRoomCategories')) {
  addRoomCategories()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script error:', error);
      process.exit(1);
    });
}

export { addRoomCategories, roomCategories };

