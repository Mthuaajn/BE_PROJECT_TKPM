import * as fs from 'fs';
import path from 'path';

// Specify the directory to watch
const directoryToWatch = path.join(__dirname, '../models/DataSourcePlugin');

// Create a FileWatcher instance
const fileWatcher = fs.watch(directoryToWatch, (eventType, filename) => {
  if (eventType === 'rename' && filename) {
    console.log(`File added: ${filename}`);
    // You can perform additional actions here when a file is added
  }
});

// Handle errors
fileWatcher.on('error', (error) => {
  console.error(`Error watching directory: ${error.message}`);
});

// Close the watcher when no longer needed
// fileWatcher.close();
