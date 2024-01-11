const ffmpeg = require('fluent-ffmpeg');
// const ffmpegStatic = require('ffmpeg-static');
const fs = require('fs').promises;

// const path = require('path');
// const ffmpegStaticPath = path
//   .join(__dirname, '../node_modules/ffmpeg-static/ffmpeg.exe')
//   .replace(/\\/g, '/');

const { createClient } = require('@deepgram/sdk');

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// async function ffmpeg(command) {
//   return new Promise((resolve, reject) => {
//     exec(`${ffmpegStatic} ${command}`, (err, stderr, stdout) => {
//       if (err) reject(err);
//       resolve(stdout);
//     });
//   });
// }

// async function downloadFile(url) {
//   return new Promise((resolve, reject) => {
//     const request = https.get(url, (response) => {
//       const fileName = url.split('/').slice(-1)[0]; // Get the final part of the URL only
//       const fileStream = fs.createWriteStream(fileName);
//       response.pipe(fileStream);
//       response.on('end', () => {
//         fileStream.close();
//         resolve(fileName);
//       });
//     });
//   });
// }

// async function transcribeLocalVideo(filePath) {
//   ffmpeg(`-hide_banner -y -i ${filePath} ${filePath}.wav`);

//   const audioFile = {
//     buffer: fs.readFileSync(`${filePath}.wav`),
//     mimetype: 'audio/wav',
//   };
//   const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
//     audioFile,
//     {
//       punctuation: true,
//       model: 'nova',
//     }
//   );

//   console.log(result);
//   console.log(error);
//   return result;
// }

// async function transcribeLocalVideo(filePath) {
//   try {
//     // Set FFmpeg path to the static binary
//     ffmpeg.setFfmpegPath(ffmpegStaticPath);

//     // console.log('FFmpeg path:', ffmpegStaticPath);

//     // Convert video to WAV using ffmpeg
//     await new Promise((resolve, reject) => {
//       ffmpeg(filePath)
//         .audioCodec('pcm_s16le')
//         .audioChannels(1)
//         .audioFrequency(16000)
//         .on('end', resolve)
//         .on('error', reject)
//         .save(`${filePath}.wav`);
//     });

//     // Read the WAV file
//     const audioFile = {
//       buffer: await fs.readFile(`${filePath}.wav`),
//       mimetype: 'audio/wav',
//     };

//     // console.log(await audioFile);

//     // Transcribe using Deepgram
//     const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
//       audioFile,
//       {
//         punctuation: true,
//         model: 'nova',
//       }
//     );
//     // Clean up the temporary WAV file
//     await fs.unlink(`${filePath}.wav`);

//     console.log(result);
//     return result;
//   } catch (error) {
//     console.error('Error:', error);
//     throw new Error('Transcription failed');
//   }
// }

function convertToWav(inputFile, outputFile) {
  ffmpeg(inputFile)
    .input(inputFile)
    .audioCodec('libmp3lame')
    .on('end', () => console.log('Conversion finished'))
    .on('error', (err, stdout, stderr) => {
      console.error('Error:', err);
      // console.error('ffmpeg stdout:', stdout);
      // console.error('ffmpeg stderr:', stderr);
    })
    .save(outputFile);

  // ffmpeg(inputFile)
  //   .noVideo()
  //   .audioCodec('libmp3lame')
  //   .format('mp3')
  //   .on('start', function (cmdline) {
  //     console.log('Command line: ' + cmdline);
  //   })
  //   .on('error', function (err, stdout, stderr) {
  //     console.log('err: ', err);
  //     console.log('ffmpeg stdout: ' + stdout);
  //     console.log('ffmpeg stderr: ' + stderr);
  //   })
  //   .output(outputFile)
  //   .run();
}

module.exports = { convertToWav };
