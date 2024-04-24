import { error } from 'console';
import { IFileExtensionPlugin } from '../FileExtension/IFileExtensionPlugin';
import * as fs from 'fs';

export class TXTPlugin implements IFileExtensionPlugin {
  public constructor() {}
  clone(): IFileExtensionPlugin {
    return new TXTPlugin();
  }
  public async createFile(title: string, chapter: string, content: string): Promise<any> {
    const filePath = `downloadedFile/${title}_${chapter}.txt`;
    try {
      fs.writeFileSync(filePath, content);
      return filePath;
    } catch (err) {
      console.log('Error writing file:', err);
      return null;
    }
  }
}

module.exports = {
  plugin: TXTPlugin
};