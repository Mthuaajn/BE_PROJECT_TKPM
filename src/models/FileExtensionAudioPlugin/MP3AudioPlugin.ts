import { IFileExtensionAudioPlugin } from '../FileExtensionAudioManagement/IFileExtensionAudioPlugin';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegPath.path);
export class MP3AudioPlugin implements IFileExtensionAudioPlugin {
  name: string;
  constructor() {
    this.name = 'MP3AudioPlugin';
  }
  clone(): IFileExtensionAudioPlugin {
    return new MP3AudioPlugin();
  }

  public async createFile(
    title: string,
    chapter: string,
    content: string,
    startTimeInSecond: number,
    endTimeInSecond: number,
    chapterTittle?: string | undefined
  ): Promise<any> {
    const filePath = `downloadedFile/${title}_${chapter}.mp3`;
    try {
      const startTimeStr: string = this.toTimeString(startTimeInSecond);
      const endTimeStr: string = this.toTimeString(endTimeInSecond - startTimeInSecond);

      await this.downloadAndCutVideo(content, startTimeStr, endTimeStr, filePath);
      return filePath;
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }

  private toTimeString(timeInSeconds: number): string {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    return `${hours}:${minutes}:${seconds}`;
  }

  private downloadAndCutVideo(
    url: string,
    start: string,
    end: string,
    output: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(url)
        .setStartTime(start)
        .setDuration(end)
        .output(output)
        .on('end', () => {
          console.log('Video cut and saved successfully.');
          resolve();
        })
        .on('error', (error) => {
          console.error('Error cutting video:', error);
          reject(error);
        })
        .run();
    });
  }
}

module.exports = {
  plugin: MP3AudioPlugin
};
