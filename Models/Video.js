const logger = require('../utils/logger');
const config = require('../utils/config');

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const url = config.MONGODB_URI;

logger.info('connecting to ..... MONGODB');

//connecting to the DB
mongoose
  .connect(url)
  .then(() => logger.info('Connected to MONGODB'))
  .catch((err) => logger.error('Error connecting to MONGODB', err));

//the VideoSchema
const videoSchema = new mongoose.Schema(
  {
    title: String,
    videoPath: String,
    date: { type: Date, default: Date.now },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

videoSchema.set('toJSON', {
  transform: (document, returnedVideo) => {
    returnedVideo.id = returnedVideo._id.toString();
    delete returnedVideo._id;
    delete returnedVideo.__v;
  },
});

module.exports = mongoose.model('Video', videoSchema);
