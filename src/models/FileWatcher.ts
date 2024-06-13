import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

export class FileWatcher extends EventEmitter {
  private directoryToWatch: string;
  private fileWatcher: fs.FSWatcher | null;

  constructor(directoryToWatch: string) {
    super();
    this.directoryToWatch = directoryToWatch;
    this.fileWatcher = null;
  }

  public startWatching(): void {
    this.fileWatcher = fs.watch(this.directoryToWatch, (eventType, filename) => {
      if (eventType === 'rename' && filename) {
        if (fs.existsSync(path.join(this.directoryToWatch, filename))) {
          console.log(`File added: ${filename}`);
          this.emit('fileAdded', filename);
        }
      }
    });

    this.fileWatcher.on('error', (error) => {
      console.error(`Error watching directory: ${error.message}`);
    });
  }

  public stopWatching(): void {
    if (this.fileWatcher) {
      this.fileWatcher.close();
      this.fileWatcher = null;
    }
  }
}

// To stop watching:
// fileWatcher.stopWatching();
