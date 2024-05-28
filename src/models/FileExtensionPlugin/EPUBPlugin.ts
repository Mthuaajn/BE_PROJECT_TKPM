import { error } from 'console';
import { IFileExtensionPlugin } from '../FileExtension/IFileExtensionPlugin';
import * as fs from 'fs';
import EPub from 'epub-gen';
import { before } from 'lodash';
import { promisify } from 'util';//import { EPub } from 'epub-generator';
export class EPUBPlugin implements IFileExtensionPlugin {
  name: string;
  public constructor() {
    this.name = 'EPUBPlugin';
  }
  clone(): IFileExtensionPlugin {
    return new EPUBPlugin();
  }
  public async createFile(title: string, chapter: string, content: string): Promise<any> {
    const filePath = `downloadedFile/${title}_${chapter}.epub`;
    const options = {
      title: `Book id ${title}`,
      author: 'unknown author',
      content: [
        {
          data: content,
          beforeToc: true,
          fileName: `${title}_${chapter}.html`,
          title: `Chapter ${chapter}`
        }
      ]
    };

    
    // return new Promise<string | null>(async (resolve, reject) => {
    //   try {
    //     const epub = new EPub(options, filePath);
    //     await promisify(epub.generate.bind(epub))(); // Generate the EPub file
    //     resolve(filePath);
    //   } catch (err) {
    //     console.log('Error writing file:', err);
    //     reject(err);
    //   }
    // });
    try {
      const epub = await new EPub(options, filePath);
      
      return filePath;
    } catch (err) {
      console.log('Error writing file:', err);
      return null;
    }
  }
}

module.exports = {
  plugin: EPUBPlugin
};
