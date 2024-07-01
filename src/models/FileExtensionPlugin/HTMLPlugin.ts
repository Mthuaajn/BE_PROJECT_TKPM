import { error } from 'console';
import { IFileExtensionPlugin } from '../FileExtensionManagement/IFileExtensionPlugin';
import * as fs from 'fs';
import { saveAs } from 'file-saver';

//This plugin is used for create file HTML
export class HTMLPlugin implements IFileExtensionPlugin {
  name: string;
  public constructor() {
    this.name = 'HTMLPlugin';
  }
  clone(): IFileExtensionPlugin {
    return new HTMLPlugin();
  }
  public async createFile(title: string, chapter: string, content: string): Promise<any> {
    const filePath = `downloadedFile/${title}_${chapter}.html`;
    try {
      const htmlContent = `<html>
            <head>
                <title>${title}L</title>
            </head>
            <body>
                <h1>${title}</h1>
                <h3>${chapter}</h3>
                <p>${content}</p>
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
}

module.exports = {
  plugin: HTMLPlugin
};
