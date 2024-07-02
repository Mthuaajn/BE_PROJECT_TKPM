import * as fs from 'fs';
import axios from 'axios';
import { IFileExtensionComicsPlugin } from '../FileExtensionComicsManagement/IFileExtensionComicsPlugin';
import { ChapterImage } from '../Interfaces/ChapterImage';

//This plugin is used for create file HTML
export class HTMLComicsPlugin implements IFileExtensionComicsPlugin {
  name: string;
  public constructor() {
    this.name = 'HTMLComicsPlugin';
  }
  clone(): IFileExtensionComicsPlugin {
    return new HTMLComicsPlugin();
  }
  public async createFile(title: string, chapter: string, content: ChapterImage[]): Promise<any> {
    const filePath = `downloadedFile/${title}_${chapter}.html`;
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

      fs.writeFileSync(filePath, htmlContent);
      //   const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      //   await saveAs(blob, `downloadedFile/${title}_${chapter}.html`);

      return filePath;
    } catch (err) {
      console.log('Error writing file:', err);
      return null;
    }
  }
  public async fetchImageBuffers(imageUrls: ChapterImage[]): Promise<Buffer[]> {
    const imageRequests = imageUrls.map(async (imageUrl: ChapterImage) => {
      // try {
      //   const response = await axios.get(imageUrl.image_file, {
      //     responseType: 'arraybuffer',
      //     proxy: false,
      //     timeout: 5000
      //   });
      //   return Buffer.from(response.data, 'binary');
      // } catch (error) {
      //   console.error('Error:', error);
      //   throw error; // Rethrow the error to be caught by Promise.all
      // }
      return await this.fetchImageBufferDefault(imageUrl.image_file);
    });

    return Promise.all(imageRequests);
  }
  private async fetchImageBufferDefault(imageUrl: string): Promise<Buffer> {
    try {
      const response = await fetch(imageUrl, {
        method: 'GET'
      });
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return buffer;
      } else {
        throw new Error(`Failed to fetch image. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  public async fetchImageBuffer(imageUrl: string): Promise<Buffer> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        proxy: false,
        timeout: 5000
      });
      return Buffer.from(response.data, 'binary');
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ECONNRESET') {
        // Retry the request after a delay
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return this.fetchImageBuffer(imageUrl); // Recursive call to retry
      } else {
        console.error('Error:', error);
        throw error; // Rethrow the error to be caught by Promise.all
      }
    }
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
  plugin: HTMLComicsPlugin
};
