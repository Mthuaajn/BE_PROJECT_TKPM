import { error } from 'console';
import { IFileExtensionPlugin } from '../FileExtension/IFileExtensionPlugin';
import * as fs from 'fs';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const docx = require('docx');
// import { Document, Paragraph, TextRun } from 'docx';
// import { Paragraph, TextRun } from 'docx';
export class DOCPlugin implements IFileExtensionPlugin {
  name: string;
  public constructor() {
    this.name = 'DOCPlugin';
  }
  clone(): IFileExtensionPlugin {
    return new DOCPlugin();
  }
  public async createFile(title: string, chapter: string, content: string): Promise<any> {
    const filePath = `downloadedFile/${title}_${chapter}.docx`;
    try {
      // const templatePath = `downloadedFile/${title}_${chapter}.docx`;
      // const templateContent = fs.readFileSync(templatePath, 'binary');
      // const doc = new Docxtemplater();
      // doc.loadZip(templateContent);
      // doc.setData({
      //   paragraph: content
      // });
      // doc.render();
      // const generatedDoc = doc.getZip().generate({ type: 'nodebuffer' });

      // const outputPath = filePath;
      // fs.writeFileSync(outputPath, generatedDoc);

      // const { Document, Paragraph, TextRun } = await import('docx');
      // const { saveAs } = await import('file-saver');
      // const doc = new Document();
      // const paragraph = new Paragraph(content);

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
