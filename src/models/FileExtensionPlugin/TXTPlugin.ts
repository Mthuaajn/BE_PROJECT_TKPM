import { error } from 'console';
import { IFileExtensionPlugin } from '../FileExtensionManagement/IFileExtensionPlugin';
import * as fs from 'fs';

//This plugin is used for create file TXT
export class TXTPlugin implements IFileExtensionPlugin {
  name: string;
  public constructor() {
    this.name = 'TXTPlugin';
  }
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
