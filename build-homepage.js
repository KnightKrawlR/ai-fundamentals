const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Backup the original index.html if it exists
try {
  if (fs.existsSync('./index.html')) {
    console.log('Backing up original index.html...');
    fs.copyFileSync('./index.html', './index.original.html');
  }
} catch (err) {
  console.error('Error backing up original index.html:', err);
  process.exit(1);
}

// Build the React app
try {
  console.log('Building React app...');
  execSync('npm run build', { stdio: 'inherit' });
} catch (err) {
  console.error('Error building React app:', err);
  process.exit(1);
}

// Rename the output files
try {
  console.log('Renaming output files...');
  
  // Rename index.html to homepage.html
  if (fs.existsSync('./index.html')) {
    fs.renameSync('./index.html', './new-homepage.html');
  }
  
  // Restore the original index.html
  if (fs.existsSync('./index.original.html')) {
    fs.renameSync('./index.original.html', './index.html');
  }
  
  console.log('Successfully built and renamed files!');
  console.log('The new homepage is available at new-homepage.html');
} catch (err) {
  console.error('Error renaming output files:', err);
  process.exit(1);
} 