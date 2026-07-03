const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log(`Removed existing database file: ${dbPath}`);
} else {
  console.log(`No existing database file found at: ${dbPath}`);
}

require('./database');
console.log('Database reset and seeded from seed-data.json.');
