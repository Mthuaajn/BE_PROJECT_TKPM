export interface IFileExtensionPlugin {
  clone(): IFileExtensionPlugin;
  createFile(title: string, chapter: string, content: string, chapterTittle?: string): any;
}
