export interface IFileExtensionPlugin {
  name: string;
  clone(): IFileExtensionPlugin;
  createFile(title: string, chapter: string, content: string): any;
}
