import * as fs from 'fs';

export function getFileNamesInFolder(folderPath: string): string[] {
  try {
    //console.log("folderPath: ",folderPath);
    const fileNames = fs.readdirSync(folderPath);
    return fileNames;
  } catch (error) {
    console.error('Error reading folder:', error);
    return [];
  }
}
export function removeFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex !== -1) {
    return fileName.slice(0, lastDotIndex);
  }
  return fileName;
}

export function getFileExtension(fileName: string): string {
  const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
  return fileExtension;
}

// module.exports = {
//     getFileNamesInFolder: getFileNamesInFolder,
// }
