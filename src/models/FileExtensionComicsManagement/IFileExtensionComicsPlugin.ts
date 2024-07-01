import { ChapterImage } from '../Interfaces/ChapterImage';

export interface IFileExtensionComicsPlugin {
  //name of plugin
  name: string;

  //return a clone instance of plugin
  clone(): IFileExtensionComicsPlugin;

  //create file from parameters
  createFile(title: string, chapter: string, content: ChapterImage[], chapterTittle?: string): any;
}
