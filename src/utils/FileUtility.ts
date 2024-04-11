import * as fs from 'fs';

export function getFileNamesInFolder(folderPath: string): string[] {
    try {
    console.log("folderPath: ",folderPath);
      const fileNames = fs.readdirSync(folderPath);
      return fileNames;
    } catch (error) {
      console.error('Error reading folder:', error);
      return [];
    }
}

// module.exports = {
//     getFileNamesInFolder: getFileNamesInFolder,
// }