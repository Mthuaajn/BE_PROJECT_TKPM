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
export async function createFile(title: string, chapter: string, content: string): Promise<any> {
  const filePath = `downloadedFile/${title}_${chapter}.mp3`;

  const apiKey = process.env.API_CONVERT_TEXT_TO_SPEECH_KEY || '';
  const apiUrl = 'https://api.fpt.ai/hmi/tts/v5';
  const speed = '';
  const voice = 'ngoclam';
  // const payload = Buffer.from(
  //   'có rất nhiều truyền kỳ và câu chuyện huyền bí xoay quanh nó.',
  //   'utf-8'
  // );
  const payload = JSON.stringify('nhiều');
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
  //console.log('requestOptions:', requestOptions);

  try {
    const response = await fetch(apiUrl, requestOptions);

    //console.log('response:', response);
    if (response.ok) {
      const text = await response.text();
      console.log('text: ', text);
      const dataResponse: APIFPTAIConvertTextToSpeech = JSON.parse(text);

      if (dataResponse.error !== undefined && dataResponse.error == 0 && dataResponse.async) {
        const audioResponse = await fetch(dataResponse.async); //file url in AWS

        if (audioResponse.ok) {
          const buffer = await audioResponse.arrayBuffer();
          fs.writeFileSync(filePath, Buffer.from(buffer));
          console.log('saved .mp3!');
          return filePath;
        } else {
          console.log('Cannot download audio file');
        }
      } else {
        console.log('Error when API convert text to speech');
      }
    } else {
      console.log('fetch api fpt AI fail!');
    }
  } catch (err) {
    console.log('Error writing file:', err);
    return null;
  }
}
export async function downloadFile(fileUrl: string) {
  const filePath = `downloadedFile/title_chapter.mp3`;
  try {
    const audioResponse = await fetch(fileUrl);
    if (audioResponse.ok) {
      const buffer = await audioResponse.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log('saved .mp3!');
      return filePath;
    } else {
      console.log('Cannot download audio file');
    }
  } catch (err) {
    console.log('Error writing file:', err);
    return null;
  }
}
