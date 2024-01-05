const express = require('express');
require('express-async-errors');

const app = express();
const cors = require('cors');
const morgan = require('morgan');

const userRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const videoRouter = require('./controllers/video');
const middleware = require('./utils/middleware');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(morgan('dev'));

app.use(middleware.tokenExtractor);
app.use(middleware.errorHandler);

app.use('/api/users', userRouter);
app.use('/api/login', loginRouter);
app.use('/api/videos', videoRouter);

module.exports = app;
