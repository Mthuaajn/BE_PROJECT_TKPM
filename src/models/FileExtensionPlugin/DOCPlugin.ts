import { error } from 'console';
import { IFileExtensionPlugin } from '../FileExtension/IFileExtensionPlugin';
import * as fs from 'fs';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const docx = require('docx');
// import { Document } from 'docx';
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
      const templatePath = `downloadedFile/${title}_${chapter}.docx`;
      const templateContent = fs.readFileSync(templatePath, 'binary');
      const doc = new (await require('docx')).default().Docxtemplater();
      doc.loadZip(templateContent);
      doc.setData({
        paragraph: content
      });
      doc.render();
      const generatedDoc = doc.getZip().generate({ type: 'nodebufferr' });

      const outputPath = filePath;
      fs.writeFileSync(outputPath, generatedDoc);

      const { saveAs } = await import('file-saver');
      const document = new Document();
      const paragraph = new (await require('docx')).default().Paragraph(content);

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
