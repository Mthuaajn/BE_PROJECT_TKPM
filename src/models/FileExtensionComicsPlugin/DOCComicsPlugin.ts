import { IFileExtensionComicsPlugin } from '../FileExtensionComicsManagement/IFileExtensionComicsPlugin';
import { ChapterImage } from '../Interfaces/ChapterImage';
import * as fs from 'fs';
import axios from 'axios';
import { Document, Packer, Paragraph, TextRun, Media, ImageRun } from 'docx';
import { FileChild } from 'docx/build/file/file-child';

export class DOCComicsPlugin implements IFileExtensionComicsPlugin {
  name: string;
  public constructor() {
    this.name = 'DOCComicsPlugin';
  }
  clone(): IFileExtensionComicsPlugin {
    return new DOCComicsPlugin();
  }
  public async createFile(
    title: string,
    chapter: string,
    content: ChapterImage[],
    chapterTittle?: string | undefined
  ): Promise<any> {
    const filePath = `downloadedFile/${title}_${chapter}.docx`;
    try {
      const imagePromises = await this.fetchImageBuffers(content);

      const imageBuffers = await Promise.all(imagePromises);

      const fileChilren: FileChild[] = imageBuffers.map((buffer) => {
        return new Paragraph({
          children: [
            new ImageRun({
              data: buffer,
              transformation: {
                width: 200,
                height: 320
              }
            })
          ],
          alignment: 'center'
        });
      });

      fileChilren.unshift(
        new Paragraph({
          children: [
            new TextRun({
              text: `Chapter ${chapter}`,
              bold: true
            })
          ],
          alignment: 'center'
        })
      );

      fileChilren.unshift(
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true
            })
          ],
          alignment: 'center'
        })
      );

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: fileChilren
          }
        ]
      });

      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(filePath, buffer);
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
  plugin: DOCComicsPlugin
};
