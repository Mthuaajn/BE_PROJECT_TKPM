import { wrapRequestHandler } from '~/utils/handlers';
import * as fs from 'fs';
import archiver from 'archiver';
import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { FileExtensionManager } from '~/models/FileExtensionManagement/FileExtensionManager';
import { IFileExtensionPlugin } from '~/models/FileExtensionManagement/IFileExtensionPlugin';
import { IDataSourcePlugin } from '~/models/DataSourceManagement/IDataSourcePlugin';
import { DataSourceManager } from '~/models/DataSourceManagement/DataSourceManager';
import { deleteFile } from '~/utils/FileUtility';
import { removeInvalidCharacter } from '~/utils/StringUtility';
import { ContentStory } from '~/models/Interfaces/ContentStory';
const upload = multer();

export const downloadChapter = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    const chap: string = req.query.chap?.toString() || '';
    let title: string = req.query.title?.toString() || '';
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
        const result: ContentStory | null = await plugin.contentStory(title, chap);
        // console.log('result in controller: ', result);
        if (result != null) {
          //result.chap = removeInvalidCharacter(result.chap);
          title = removeInvalidCharacter(title);
          //console.log('result in controller: ', result);
          const fileExtensionManager: FileExtensionManager = FileExtensionManager.getInstance();
          const fileExtensionPlugin: IFileExtensionPlugin | null = fileExtensionManager.select(
            `${fileExtensionType}Plugin`
          );
          const fileTxtExtensionPlugin: IFileExtensionPlugin | null =
            fileExtensionManager.select('TXTPlugin');
          if (fileExtensionPlugin != null && fileTxtExtensionPlugin != null) {
            const filePath = await fileExtensionPlugin.createFile(
              title,
              chap,
              result.content,
              result.chapterTitle ? result.chapterTitle : ''
            );

            const fileTxtPath = await fileTxtExtensionPlugin.createFile(
              title,
              chap,
              result.content
            );

            const fileName = `${title}_${chap}.${fileExtensionType.toLowerCase()}`;
            const fileTxtName = `${title}_${chap}.txt`;

            const files = [
              { name: fileName, path: filePath },
              { name: fileTxtName, path: fileTxtPath }
            ];

            const zipFileName = `${title}_${chap}.zip`; // Custom name for the ZIP file

            // Set the appropriate headers
            res.set({
              'Content-Disposition': `attachment; filename="${zipFileName}"`,
              'Content-Type': 'application/zip'
            });

            const zip = archiver('zip');
            const output = fs.createWriteStream(zipFileName);
            // zip.pipe(res);
            zip.pipe(output);

            files.forEach((file) => {
              const fileStream = fs.createReadStream(file.path);
              zip.append(fileStream, { name: file.name });
            });

            zip.finalize();
            output.on('close', () => {
              res.download(zipFileName, zipFileName, (err) => {
                if (err) {
                  console.error('Error while downloading:', err);
                  res.status(500).send('Error while downloading the file');
                } else {
                  //delete file
                  deleteFile(filePath);
                  deleteFile(fileTxtPath);
                  fs.unlink(zipFileName, (err) => {
                    if (err) {
                      console.error('Error while deleting the file:', err);
                    }
                  });
                }
              });
            });
          }
        } else {
          res.json({ success: false, message: 'cannot get content' });
        }
      } else {
        res.json({ success: false, message: 'plugin source errors' });
      }
    } else {
      res.json({ success: false, message: 'source is not valid' });
    }
  }
);
export const listFileExtension = wrapRequestHandler(
  async (req: Request<ParamsDictionary, any>, res: Response, next: NextFunction) => {
    const fileExtensionManager: FileExtensionManager = FileExtensionManager.getInstance();
    const nameFileExtension: string[] = fileExtensionManager.getAllPluginName();
    const data: object = {
      length: nameFileExtension.length,
      names: nameFileExtension
    };
    res.json(data);
  }
);
/** const files = [
              { name: fileName, path: filePath },
              { name: fileTxtName, path: fileTxtPath }
            ];

            const zipFileName = `${title}_${chap}.zip`; // Custom name for the ZIP file

            // Set the appropriate headers
            res.set({
              'Content-Disposition': `attachment; filename="${zipFileName}"`,
              'Content-Type': 'application/zip'
            });

            const zip = archiver('zip');

            zip.pipe(res);

            files.forEach((file) => {
              const fileStream = fs.createReadStream(file.path);
              zip.append(fileStream, { name: file.name });
            });

            zip.finalize(); */
/** res.set({
              'Content-Disposition': `attachment; filename="${fileName}"`,
              'Content-Type': 'text/plain'
            });
            const file1Stream = fs.createReadStream(filePath);
            file1Stream.pipe(res);

            res.set({
              'Content-Disposition': `attachment; filename="${fileTxtName}"`,
              'Content-Type': 'text/plain'
            });
            const file2Stream = fs.createReadStream(fileTxtPath);
            file2Stream.pipe(res); */
/* if (fileExtensionPlugin != null) {
            const filePath = await fileExtensionPlugin.createFile(title, chap, result.content); //const fileName =
            if (filePath) {
              console.log('filePath: ', filePath);
              res.set({
                'Content-Disposition': `attachment; filename="${title}_${chap}.${fileExtensionType.toLowerCase()}"`,
                'Content-Type': 'text/plain'
              });
              const file2Stream = fs.createReadStream(filePath);
              file2Stream.pipe(res);
            } else {
              console.error('Error creating file.');
              res.sendStatus(500);
            }
           
          } else {
            res.json({ success: false, message: 'plugin file extension errors' });
          }
          if (fileTxtExtensionPlugin != null) {
            const fileTxtPath = await fileTxtExtensionPlugin.createFile(
              title,
              chap,
              result.content
            );
            if (fileTxtPath) {
              res.set({
                'Content-Disposition': `attachment; filename="${title}_${chap}.txt"`,
                'Content-Type': 'text/plain'
              });
              const file1Stream = fs.createReadStream(fileTxtPath);
              file1Stream.pipe(res);
            } else {
              console.error('Error creating file.');
              res.sendStatus(500);
            }
          } else {
            res.json({ success: false, message: 'plugin file extension errors' });
          } */
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
// res.download(filePath, filePath, (err) => {
//   if (err) {
//     console.error('Error sending file:', err);
//   } else {
//     //console.log('File sent successfully.');
//   }
// });
