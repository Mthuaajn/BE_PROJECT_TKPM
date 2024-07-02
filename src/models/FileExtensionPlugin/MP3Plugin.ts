import { IFileExtensionPlugin } from '../FileExtensionManagement/IFileExtensionPlugin';
import * as fs from 'fs';
import { env } from 'process';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
interface APIFPTAIConvertTextToSpeech {
  error?: number;
  async?: string;
  request_id?: string;
  message?: string;
}
export class MP3Plugin implements IFileExtensionPlugin {
  name: string;
  constructor() {
    this.name = 'MP3Plugin';
  }
  clone(): IFileExtensionPlugin {
    return new MP3Plugin();
  }
  public async createFile(
    title: string,
    chapter: string,
    content: string,
    chapterTittle?: string | undefined
  ): Promise<any> {
    const filePath = `downloadedFile/${title}_${chapter}.mp3`;

    const apiKey = process.env.API_CONVERT_TEXT_TO_SPEECH_KEY || '';
    const apiUrl = 'https://api.fpt.ai/hmi/tts/v5';
    const speed = '';
    const voice = 'ngoclam';

    let payload = content.slice(0, 500); //JSON.stringify(content);
    const lastSpaceIndex = payload.lastIndexOf(' ');

    if (lastSpaceIndex != -1) {
      payload = payload.slice(0, lastSpaceIndex);
    }

    const headers: Record<string, string> = {
      'api-key': apiKey,
      speed: speed,
      voice: voice
    };

    const requestOptions = {
      method: 'POST',
      headers: headers,
      body: payload
    };
    //console.log(requestOptions);
    try {
      const response = await fetch(apiUrl, requestOptions);

      //console.log('response:', response);
      if (response.ok) {
        const text = await response.text();
        console.log('text: ', text);
        const dataResponse: APIFPTAIConvertTextToSpeech = JSON.parse(text);

        if (dataResponse.error !== undefined && dataResponse.error == 0 && dataResponse.async) {
          do {
            const audioResponse = await fetch(dataResponse.async); //file url in AWS
            if (audioResponse.ok) {
              const buffer = await audioResponse.arrayBuffer();
              fs.writeFileSync(filePath, Buffer.from(buffer));
              console.log('saved .mp3!');
              return filePath;
              break;
            } else {
              console.log('Cannot download audio file');
            }

            await this.sleep(10000);
            // eslint-disable-next-line no-constant-condition
          } while (true);
        } else {
          console.log('Error when API convert text to speech');
        }
      } else {
        console.log('fetch api fpt AI fail!');
      }
      return null;
    } catch (err) {
      console.log('Error writing file:', err);
      return null;
    }
  }

  public async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = {
  plugin: MP3Plugin
};
