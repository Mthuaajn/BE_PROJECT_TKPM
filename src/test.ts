import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';

ffmpeg.setFfmpegPath(ffmpegPath.path);

const videoUrl =
  'https://ia800308.us.archive.org/14/items/ThanBiKhoiPhucTuQuyHoBatDauTH/002-ThanBiKhoiPhucTuQuyHoBatDauTH.mp3';
const startTime = '00:00:30'; // Start time of the desired portion
const endTime = '00:01:30'; // End time of the desired portion
const outputFilePath = 'output.mp3'; // Output file path

function downloadAndCutVideo(
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

async function createFile() {
  try {
    await downloadAndCutVideo(videoUrl, startTime, endTime, outputFilePath);
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

export default createFile;
