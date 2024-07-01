export interface IFileExtensionAudioPlugin {
  //name of plugin
  name: string;

  //return a clone instance of plugin
  clone(): IFileExtensionAudioPlugin;

  //create file from parameters
  createFile(
    title: string,
    chapter: string,
    content: string,
    startTimeInSecond: number,
    endTimeInSecond: number,
    chapterTittle?: string
  ): any;
}
