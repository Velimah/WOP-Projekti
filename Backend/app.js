'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoute = require('./routes/authRoute');
const messageRoute = require('./routes/messageRoute');
const userRoute = require('./routes/userRoute');
const {httpError} = require('./utils/errors');
const passport = require('./utils/pass');
const app = express();
const port = 3000;

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if (process.env.NODE_ENV === 'production') {
  require('./utils/production')(app, process.env.HTTP_PORT || 3000, process.env.HTTPS_PORT || 8000);
} else {
  require('./utils/localhost')(app, process.env.HTTP_PORT || 3000);
}

app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

app.use(passport.initialize());

app.use(express.static('uploads'));
app.use('/thumbnails', express.static('thumbnails'));

app.use('/auth', authRoute);
app.use('/message', passport.authenticate('jwt', {session: false}), messageRoute);
app.use('/user', passport.authenticate('jwt', {session: false}), userRoute);
app.use('/like', passport.authenticate('jwt', {session: false}), messageRoute);

app.use((req, res, next) => {
  const err = httpError('Not found', 404);
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).
      json({message: err.message || 'Internal server error'});
});
