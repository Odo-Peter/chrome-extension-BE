/**
 * controllers - video controller
 *
 * Creates a new video from the body request recieved
 * and connects with a authenticated user
 * adds the created user to the database
 *
 * An express router (videoRouter) that routes to a /video endpoints
 * uses bcryptjs for authentication
 */

const videoRouter = require('express').Router();

const fs = require('fs');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const pathRoute = require('path');

const Video = require('../Models/Video');

const { userExtractor } = require('../utils/middleware');
const { transcribeLocalVideo } = require('../utils/deepgram');

videoRouter.get('/', async (req, res) => {
  const videos = await Video.find({}).populate('user', {
    email: 1,
  });
  res.json(videos);
});

videoRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  const video = await Video.findById(id);

  if (!video) res.status(404).json({ error: 'File not found' });

  res.status(200).json(video);
});

videoRouter.post(
  '/',
  userExtractor,
  uploadMiddleware.single('file'),
  async (req, res) => {
    const { title } = req.body;
    const { originalname, path } = req.file;
    const user = req.user;

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized request',
      });
    }

    const fileExtension =
      originalname.split('.')[originalname.split('.').length - 1];
    const videoPath = path + '.' + fileExtension;
    fs.renameSync(path, videoPath);

    const absolutePath =
      videoPath.split('\\')[videoPath.split('\\').length - 1];

    const inputFilePath = pathRoute.resolve(
      __dirname,
      '../uploads',
      absolutePath
    );

    const transcript = await transcribeLocalVideo(inputFilePath);

    try {
      if (transcript !== 'Transcribing, please wait' || transcript) {
        const newVideo = new Video({
          title,
          videoPath,
          transcript,
          user: user.id,
        });

        const wavPath = pathRoute.resolve(
          __dirname,
          '../uploads',
          `${absolutePath.split('.')[0]}.wav`
        );

        fs.unlinkSync(wavPath);

        const savedVideo = await newVideo.save();
        user.videos = user.videos.concat(savedVideo._id);
        await user.save();

        res.status(201).json(savedVideo);
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// videoRouter.put('/:id', userExtractor, async (req, res) => {
//   const { todo, checked } = req.body;
//   const { id } = req.params;

//   const user = req.user;
//   if (!user) {
//     return res.status(401).json({
//       error: 'Unauthorized request',
//     });
//   }

//   const newTodo = {
//     todo,
//     checked,
//   };

//   const updatedTodo = await Todo.findByIdAndUpdate(id, newTodo, { new: true });

//   res.json(updatedTodo);
// });

videoRouter.delete('/:id', userExtractor, async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const video = await Video.findById(id);

  if (!video) {
    res.status(404).json({ error: 'Not Found' });
  }

  if (!(video.user.toString() === user.id.toString())) {
    res.status(405).json({ error: 'Permission Denied' });
  }

  const videoFilePath =
    video?.videoPath.split('\\')[video?.videoPath.split('\\').length - 1];

  const unlinkSyncVideo = pathRoute.resolve(
    __dirname,
    '../uploads',
    videoFilePath
  );

  // console.log(videoFilePath);

  await Video.findByIdAndDelete(id);

  fs.unlinkSync(unlinkSyncVideo);
  res.status(204).end();
});

module.exports = videoRouter;
