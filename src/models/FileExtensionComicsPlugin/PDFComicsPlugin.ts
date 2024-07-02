import { IFileExtensionComicsPlugin } from '../FileExtensionComicsManagement/IFileExtensionComicsPlugin';
import { ChapterImage } from '../Interfaces/ChapterImage';
import axios from 'axios';
import * as puppeteer from 'puppeteer';

function sanitizeTitle(title: string): string {
  // Thay thế các ký tự không hợp lệ thành ký tự hợp lệ có dấu _
  return title.replace(/[^a-zA-Z0-9 \-_]/g, '_');
}

export class PDFComicsPlugin implements IFileExtensionComicsPlugin {
  name: string;
  public constructor() {
    this.name = 'PDFComicsPlugin';
  }

  clone(): IFileExtensionComicsPlugin {
    return new PDFComicsPlugin();
  }

  public async createFile(
    title: string,
    chapter: string,
    content: ChapterImage[],
    chapterTitle: string
  ): Promise<any> {
    title = sanitizeTitle(title);
    const filePath = `downloadedFile/${title}_${chapter}.pdf`;

    try {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      const pdfOptions = {
        path: filePath,
        format: 'A4'
      };

      // const pdfPromises = content.map(async (element: ChapterImage) => {
      //   await page.goto(element.image_file);
      //   await page.waitForSelector('img');
      //   const imageHandle = await page.$('img');
      //   const imageBuffer = await imageHandle?.screenshot();
      //   return imageBuffer;
      // });

      const pdfPromises = await this.fetchImageBuffers(content);

      const imageBuffers = await Promise.all(pdfPromises);

      const htmlContent = `
        <html>
          <head>
            <title>${title}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 40px;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 20px;
              }
              h3 {
                font-size: 18px;
                margin-bottom: 20px;
              }
              p {
                font-size: 12px;
                line-height: 1.5;
              }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <h3>${chapterTitle}</h3>
            <p>Content: </p>
            ${this.getImageTags(imageBuffers)}
          </body>
        </html>`;

      await page.setContent(htmlContent, { waitUntil: 'networkidle2', timeout: 60000 });

      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '40px',
          bottom: '40px',
          left: '40px',
          right: '40px'
        }
      });

      await browser.close();

      return filePath;
    } catch (err) {
      console.log('Error writing file:', err);
      return null;
    }
  }
  public async fetchImageBuffers(imageUrls: ChapterImage[]): Promise<Buffer[]> {
    const imageRequests = imageUrls.map(async (imageUrl: ChapterImage) => {
      const response = await axios.get(imageUrl.image_file, {
        responseType: 'arraybuffer',
        proxy: false
      });
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
  plugin: PDFComicsPlugin
};
