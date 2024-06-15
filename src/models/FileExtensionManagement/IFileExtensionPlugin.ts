//This is interface that downloading plugin must implement, and is the abstraction
export interface IFileExtensionPlugin {
  //name of plugin
  name: string;

  //return a clone instance of plugin
  clone(): IFileExtensionPlugin;

  //create file from parameters
  createFile(title: string, chapter: string, content: string, chapterTittle?: string): any;
}
