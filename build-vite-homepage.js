const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure the output directory exists
const OUTPUT_DIR = './public-homepage';
try {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }
} catch (err) {
  console.error(`Error creating output directory: ${err}`);
  process.exit(1);
}

// Build the Vite app
try {
  console.log('Building the Vite homepage app...');
  execSync('cd ai-fundamentals-cursor-package && npm install && npm run build', { stdio: 'inherit' });
  console.log('Vite build completed successfully');
  
  // Copy the build output to the root output directory
  const sourceDir = './ai-fundamentals-cursor-package/dist';
  
  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: Source directory ${sourceDir} does not exist after build`);
    process.exit(1);
  }
  
  // List files in the source directory (for debugging)
  const files = fs.readdirSync(sourceDir);
  console.log(`Files in ${sourceDir}: ${files.join(', ')}`);
  
  // Copy all files from the source directory to the output directory
  fs.cpSync(sourceDir, OUTPUT_DIR, { recursive: true, force: true });
  console.log(`Copied build output from ${sourceDir} to ${OUTPUT_DIR}`);
  
} catch (err) {
  console.error(`Error building or copying Vite app: ${err}`);
  process.exit(1);
}

console.log('Done! The Vite homepage is ready to be deployed.'); 