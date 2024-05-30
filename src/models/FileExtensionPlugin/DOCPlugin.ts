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
      // const templateContent = `
      //                           <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      //                             <w:body>
      //                               <w:p>
      //                                 <w:r>
      //                                   <w:t>{{paragraph}}</w:t>
      //                                 </w:r>
      //                               </w:p>
      //                             </w:body>
      //                           </w:document>
      //                         `;
      // // Create a new Docxtemplater instance with the template content
      // const doc = new Docxtemplater(templateContent);

      // // Set the data to be used in the template
      // const data = {
      //   paragraph: 'This is a paragraph of text.',
      // };

      // // Set the data in the template
      // doc.setData(data);

      // // Render the document
      // doc.render();

      // // Get the output as a binary buffer
      // const buffer = doc.getZip().generate({ type: 'nodebuffer' });

      // // Save the buffer to a .docx file
      // fs.writeFileSync('output.docx', buffer);

      // const doc = new (await require('docx')).default().Docxtemplater(); // new Docxtemplater();
      // doc.loadZip(templateContent);
      // doc.setData({
      //   paragraph: content
      // });
      // doc.render();
      // const generatedDoc = doc.getZip().generate({ type: 'nodebuffer' });

      // const outputPath = filePath;
      // fs.writeFileSync(outputPath, generatedDoc);

      // //const { Document, Paragraph, TextRun } = (await import('docx')).default;
      // const { saveAs } = await import('file-saver');
      // const document = new Document();
      // // eslint-disable-next-line prettier/prettier
      // const paragraph =new (await require('docx')).default().Paragraph(content);// new Paragraph(content);

      const doc = new (await require('docx')).default().Document();
      const paragraph = new (await require('docx')).default().Paragraph({
        text: content,
      });
      doc.addParagraph(paragraph);

      // Generate the output as a buffer
      const buffer = await (await require('docx')).default().Packer.toBuffer(doc);

      // Save the buffer to a .docx file
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
