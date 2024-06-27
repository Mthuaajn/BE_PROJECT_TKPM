import text2wav = require('text2wav');
import * as fs from 'fs';

export async function createFile(title: string, chapter: string, content: string): Promise<any> {
  const filePath = `downloadedFile/${title}_${chapter}.wav`;
  try {
    const out = await text2wav(
      'Tao là tiến. Về kết hôn âm dương, có rất nhiều truyền kỳ và câu chuyện huyền bí xoay quanh nó.Trung Quốc thời đó chuộng loại kết hôn này coi như một cách để thành toàn vong linh người đã khuất.Có điều ở hiện đại, không mấy ai còn làm điều này nữa.!',
      { voice: 'vi-vn-x-south+mb-cn1', wordGap: 300, speed:200  }
    );
    fs.writeFileSync(filePath, out);
    console.log('save wav');
    return filePath;
  } catch (err) {
    console.log('Error writing file:', err);
    return null;
  }
}
