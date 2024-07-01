import { error } from 'console';
import { IFileExtensionPlugin } from '../FileExtensionManagement/IFileExtensionPlugin';
import * as fs from 'fs';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, Media, ImageRun } from 'docx';
// eslint-disable-next-line @typescript-eslint/no-var-requires
//const docx = require('docx');
// import { Document } from 'docx';
// import { Paragraph, TextRun } from 'docx';

//This plugin is used for create file DOC
export class DOCPlugin implements IFileExtensionPlugin {
  public constructor() {
    this.name = 'DOCPlugin';
  }
  name: string;
  clone(): IFileExtensionPlugin {
    return new DOCPlugin();
  }
  public async createFile(title: string, chapter: string, content: string): Promise<any> {
    const filePath = `downloadedFile/${title}_${chapter}.docx`;
    try {
      const templatePath = `downloadedFile/${title}_${chapter}.docx`;

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: title,
                    bold: true
                  })
                ],
                alignment: 'center'
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Chapter ${chapter}`,
                    bold: true
                  })
                ],
                alignment: 'center'
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: content,
                    size: 24
                  })
                ],
                alignment: 'left'
              })
            ]
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
}

module.exports = {
  plugin: DOCPlugin
};
