import { IFileExtensionComicsPlugin } from '../FileExtensionComicsManagement/IFileExtensionComicsPlugin';
import { ChapterImage } from '../Interfaces/ChapterImage';
import Epub = require('epub-gen');
import axios from 'axios';

export class EPUBComicsPlugin implements IFileExtensionComicsPlugin {
  name: string;
  public constructor() {
    this.name = 'EPUBComicsPlugin';
  }
  clone(): IFileExtensionComicsPlugin {
    return new EPUBComicsPlugin();
  }
  public async createFile(
    title: string,
    chapter: string,
    content: ChapterImage[],
    chapterTittle?: string | undefined
  ): Promise<any> {
    const filePath = `downloadedFile/${title}_${chapter}.epub`;

    try {
      const imagePromises = await this.fetchImageBuffers(content);

      const imageBuffers = await Promise.all(imagePromises);

      const htmlContent = `<html>
            <head>
                <title>${title}L</title>
            </head>
            <body>
                <h1>${title}</h1>
                <h3>${chapter}</h3>
                 ${this.getImageTags(imageBuffers)}
            </body>
        </html>`;

      const options = {
        title: `Book id ${title}`,
        author: 'unknown author',
        content: [
          {
            data: htmlContent,
            beforeToc: true,
            fileName: `${title}_${chapter}.html`,
            title: `Chapter ${chapter}`
          }
        ]
      };
      const epub = await new Epub(options, filePath);

      await epub.promise.then(() => {
        return filePath;
      });

      return filePath;
    } catch (err) {
      console.log('Error writing file:', err);
      return null;
    }
  }
  public async fetchImageBuffers(imageUrls: ChapterImage[]): Promise<Buffer[]> {
    const imageRequests = imageUrls.map(async (imageUrl: ChapterImage) => {
      const response = await axios.get(imageUrl.image_file, { responseType: 'arraybuffer' });
      return Buffer.from(response.data, 'binary');
    });

    return Promise.all(imageRequests);
  }
  public getImageTags(imageBuffers: Buffer[]): string {
    return imageBuffers
      .map((buffer) => {
        if (buffer && buffer != undefined) {
          const base64 = buffer.toString('base64');
          return `<div class="image-container"><img src="data:image/jpeg;base64,${base64}"></div>`;
        }
      })
      .join('');
  }
}

module.exports = {
  plugin: EPUBComicsPlugin
};
