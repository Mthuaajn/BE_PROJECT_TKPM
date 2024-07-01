import { IFileExtensionPlugin } from '../FileExtensionManagement/IFileExtensionPlugin';
import Epub = require('epub-gen');

//This plugin is used for create file EPUB
export class EPUBPlugin implements IFileExtensionPlugin {
  public constructor() {
    this.name = 'EPUBPlugin';
  }
  name: string;
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

    try {
      const epub = await new Epub(options, filePath).promise;

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
