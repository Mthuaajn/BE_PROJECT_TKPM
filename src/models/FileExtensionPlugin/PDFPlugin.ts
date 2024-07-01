import { IFileExtensionPlugin } from '../FileExtensionManagement/IFileExtensionPlugin';
import * as puppeteer from 'puppeteer';

function sanitizeTitle(title: string): string {
  // Thay thế các ký tự không hợp lệ thành ký tự hợp lệ có dấu _
  return title.replace(/[^a-zA-Z0-9 \-_]/g, '_');
}

//This plugin is used for create file PDF
export class PDFPlugin implements IFileExtensionPlugin {
  name: string;
  public constructor() {
    this.name = 'PDFPlugin';
  }

  clone(): IFileExtensionPlugin {
    return new PDFPlugin();
  }

  public async createFile(
    title: string,
    chapter: string,
    content: string,
    chapterTitle: string
  ): Promise<any> {
    title = sanitizeTitle(title);
    const filePath = `downloadedFile/${title}_${chapter}.pdf`;

    try {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

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
            <p>${content.replace(/\n/g, '<br>')}</p>
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
}

module.exports = {
  plugin: PDFPlugin
};
