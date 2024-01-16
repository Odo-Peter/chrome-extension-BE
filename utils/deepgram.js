const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const { createClient } = require('@deepgram/sdk');
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

function convertToWav(filePath) {
  ffmpeg(filePath)
    .input(filePath)
    .audioCodec('pcm_s16le')
    .on('end', () => console.log('Conversion finished'))
    .on('error', (err, stdout, stderr) => {
      console.error('Error:', err);
    })
    .save(`${filePath.split('.')[0]}.wav`);
}

async function transcribeLocalVideo(filePath) {
  convertToWav(filePath);

  const wavPath = `${filePath.split('.')[0]}.wav`;
  const pathPresent = path.resolve(__dirname, '../uploads', wavPath);

  if (pathPresent) {
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      fs.createReadStream(filePath),
      {
        model: 'nova',
      }
    );

    if (error) {
      return `An error occurred: ${error}`;
    }

    return result.results.channels[0].alternatives[0].transcript;
  }
  return 'Transcribing, please wait';
}

module.exports = { transcribeLocalVideo };
