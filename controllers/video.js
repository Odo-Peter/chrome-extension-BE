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
const path = require('path');

const Video = require('../Models/Video');

const { userExtractor } = require('../utils/middleware');
const { convertToWav, transcribeLocalVideo } = require('../utils/deepgram');

const { createClient } = require('@deepgram/sdk');
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

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

  const absolutePath =
    video?.videoPath.split('\\')[video?.videoPath.split('\\').length - 1];

  const inputFilePath = path.resolve(__dirname, '../uploads', absolutePath);
  // const outputFilePath = path.resolve(
  //   __dirname,
  //   '../wav/8b23d7d8b2a3afedf2384b9f064e6301.wav'
  // );

  const transcript = await transcribeLocalVideo(inputFilePath);

  res.status(200).json(transcript);
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

    const newVideo = new Video({
      title,
      videoPath,
      user: user.id,
    });

    console.log(videoPath);

    const savedVideo = await newVideo.save();
    user.videos = user.videos.concat(savedVideo._id);
    await user.save();

    res.status(201).json(savedVideo);
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

// videoRouter.delete('/:id', userExtractor, async (req, res) => {
//   const { id } = req.params;
//   const user = req.user;

//   const todo = await Todo.findById(id);

//   if (!(todo.user.toString() === user.id.toString())) {
//     return res.status(405).json({ error: 'Permission Denied' });
//   }

//   await Todo.findByIdAndDelete(id);
//   res.status(201).end();
// });

module.exports = videoRouter;
