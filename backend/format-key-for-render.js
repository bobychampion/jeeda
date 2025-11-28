#!/usr/bin/env node
/**
 * Helper script to format Firebase private key for Render environment variable
 * Usage: node format-key-for-render.js <path-to-service-account.json>
 * 
 * This will output the correctly formatted FIREBASE_PRIVATE_KEY value
 * that you can copy and paste directly into Render's environment variables.
 */

import fs from 'fs';
import path from 'path';

const jsonPath = process.argv[2];

if (!jsonPath) {
  console.error('\n❌ Error: Please provide path to Firebase service account JSON file\n');
  console.error('Usage: node format-key-for-render.js <path-to-service-account.json>\n');
  console.error('Example: node format-key-for-render.js ../coupleit-firebase-adminsdk-fbsvc-083446a894.json\n');
  process.exit(1);
}

try {
  const jsonContent = fs.readFileSync(jsonPath, 'utf8');
  const credentials = JSON.parse(jsonContent);

  // Format private key - replace actual newlines with \n (for Render)
  const privateKey = credentials.private_key.replace(/\n/g, '\\n');

  console.log('\n' + '='.repeat(70));
  console.log('📋 Copy these values to Render Environment Variables:');
  console.log('='.repeat(70) + '\n');
  
  console.log('FIREBASE_PROJECT_ID=' + credentials.project_id);
  console.log('FIREBASE_CLIENT_EMAIL=' + credentials.client_email);
  console.log('FIREBASE_PRIVATE_KEY="' + privateKey + '"');
  
  console.log('\n' + '='.repeat(70));
  console.log('📝 Instructions:');
  console.log('='.repeat(70));
  console.log('1. Go to Render Dashboard → Your Service → Environment');
  console.log('2. Add/Edit each variable above');
  console.log('3. For FIREBASE_PRIVATE_KEY, copy the ENTIRE value including quotes');
  console.log('4. Save and redeploy\n');
  
  // Also create a single-line version for easy copy-paste
  console.log('='.repeat(70));
  console.log('📦 Single-line format (easier to copy):');
  console.log('='.repeat(70) + '\n');
  console.log(`FIREBASE_PRIVATE_KEY="${privateKey}"\n`);

} catch (error) {
  console.error('\n❌ Error reading JSON file:', error.message);
  console.error('\nMake sure the file path is correct and the file is valid JSON.\n');
  process.exit(1);
}

