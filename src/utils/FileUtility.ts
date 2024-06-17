import * as fs from 'fs';
import path from 'path';
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

export function deleteFile(filePath: string): void {
  fs.unlink(filePath, (error) => {
    if (error) {
      console.error('Error deleting file:', error);
    } else {
      console.log('File deleted successfully: ', filePath);
    }
  });
}
export function readDirectChildFolder(folderPath: string): string[] {
  const childFolders: string[] = fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.join(folderPath, dirent.name));

  return childFolders;
}

// module.exports = {
//     getFileNamesInFolder: getFileNamesInFolder,
// }
