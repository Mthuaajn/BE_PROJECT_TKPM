import { error } from 'console';
import { IFileExtensionPlugin } from '../FileExtension/IFileExtensionPlugin';
import * as fs from 'fs';
import  Docxtemplater from 'docxtemplater';

export class DOCPlugin implements IFileExtensionPlugin {
  public constructor() {}
  clone(): IFileExtensionPlugin {
    return new DOCPlugin();
  }
  public async createFile(title: string, chapter: string, content: string): Promise<any> {
    const filePath = `downloadedFile/${title}_${chapter}.doc`;
    try {
      const templatePath = `downloadedFile/${title}_${chapter}.docx`;
      const templateContent = fs.readFileSync(templatePath, 'binary');
      const doc = new Docxtemplater();
      doc.loadZip(templateContent);
      doc.setData({
        paragraph: content
      });
      doc.render();
      const generatedDoc = doc.getZip().generate({ type: 'nodebuffer' });

      const outputPath = filePath;
      fs.writeFileSync(outputPath, generatedDoc);

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
