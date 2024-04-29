import { wrapRequestHandler } from '~/utils/handlers';
import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { FileExtensionManager } from '~/models/FileExtension/FileExtensionManager';
import { IFileExtensionPlugin } from '~/models/FileExtension/IFileExtensionPlugin';
import { IDataSourcePlugin } from '~/models/DataSource/IDataSourcePlugin';
import { DataSourceManager } from '~/models/DataSource/DataSourceManager';
interface contentStoryAPI {
  name: string;
  title: string;
  chapterTitle: string;
  chap: string;
  host: string;
  content: string;
}
export const downloadChapter = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    const chap: string = req.query.chap?.toString() || '';
    const title: string = req.query.title?.toString() || '';
    const source: string = req.query.datasource?.toString() || '';
    const fileExtensionType = req.query.type?.toString() || '';
    console.log('source: ', source);
    console.log('title: ', title);
    console.log('chap: ', chap);
    console.log('fileExtensionType: ', fileExtensionType);

    if (source != null) {
      const dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
      const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin`);
      if (plugin != null) {
        const result: contentStoryAPI | null = await plugin.contentStory(title, chap);
        if (result != null) {
          const fileExtensionManager: FileExtensionManager = FileExtensionManager.getInstance();
          const fileExtensionPlugin: IFileExtensionPlugin | null = fileExtensionManager.select(
            `${fileExtensionType}Plugin`
          );

          if (fileExtensionPlugin != null) {
            const filePath = await fileExtensionPlugin.createFile(title, chap, result.content); //const fileName =
            console.log('filePath: ', filePath);
            res.download(filePath, filePath, (err) => {
              if (err) {
                console.error('Error sending file:', err);
              } else {
                console.log('File sent successfully.');
              }
            });
            /* res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=${requestedFile}`);
     res.send(file);*/
            /*const files = [
    { path: './file1.docx', name: 'file1.docx' },
    { path: './file2.pdf', name: 'file2.pdf' }
    // Add more files as needed
  ];

  // Set response headers for each file
  files.forEach(file => {
    res.attachment(file.name);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.download(file.path, err => {
      if (err) {
        console.log('Error sending file:', err);
      }
    });
  }); */
          } else {
            res.json({ success: false, message: 'plugin errors' });
          }
        } else {
          res.json({ quantity: 0 });
        }
      } else {
        res.json({ success: false, message: 'plugin errors' });
      }
    } else {
      res.json({ success: false, message: 'source is not valid' });
    }
  }
);
