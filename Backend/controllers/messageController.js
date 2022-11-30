'use strict';
const {getAllMessages, getMessage, addMessage, updateMessage, deleteMessage, likeMessage} = require(
  '../models/messageModel');
const {httpError} = require('../utils/errors');
const {validationResult} = require('express-validator');
const sharp = require('sharp');
const {getCoordinates} = require('../utils/imageMeta');

const message_list_get = async (req, res, next) => {
  try {
    const messages = await getAllMessages(next);
    if (messages.length < 1) {
      next(httpError('No messages found', 404));
      return;
    }
    res.json(messages);
  } catch (e) {
    console.error('message_list_get', e.message);
    next(httpError('Internal server error', 500));
  }
};

const message_get = async (req, res, next) => {
  try {
    const message = await getMessage(req.params.id, next);
    if (message.length < 1) {
      next(httpError('No message found', 404));
      return;
    }
    res.json(message.pop());
  } catch (e) {
    console.error('message_get', e.message);
    next(httpError('Internal server error', 500));
  }
};

const message_post = async (req, res, next) => {
  try {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors.
      // Error messages can be returned in an array using `errors.array()`.
      console.error('message_post validation', errors.array());
      next(httpError('Invalid data', 400));
      return;
    }

    console.log('message_post_testi', req.body, req.file);

    if (req.file !== undefined) {

      const thumbnail = await sharp(req.file.path).withMetadata().rotate().resize(560, 300).png().toFile('./thumbnails/' + req.file.filename);
/*
      const dimensions = sizeOf(req.file.path);
      console.log(dimensions.width, dimensions.height);
      if (dimensions.width < dimensions.height) {
        thumbnail = await sharp(req.file.path).withMetadata().resize(560, 300).png().toFile('./thumbnails/' + req.file.filename);
      } else {
        thumbnail = await sharp(req.file.path).withMetadata().rotate().resize(560, 300).png().toFile('./thumbnails/' + req.file.filename);
      }
*/
      console.log(thumbnail);
      const coords = await getCoordinates(req.file.path);


     // console.log(coords);

      const data = [
        req.body.message_body,
        req.user.user_id,
        req.body.board_id,
        req.file.filename,
        JSON.stringify(coords),
      ];

      const result = await addMessage(data, next);
      if (result.affectedRows < 1) {
        next(httpError('Invalid data', 400));
        return;
      }
      if (thumbnail) {
        res.json({
          message: 'message added',
          message_id: result.insertId,
        });
      }

    } else {

      const data = [
        req.body.message_body,
        req.user.user_id,
        req.body.board_id,
        "",
        "[24.74,60.24]",
      ];

      const result = await addMessage(data, next);
      if (result.affectedRows < 1) {
        next(httpError('Invalid data', 400));
        return;
      }
        res.json({
          message: 'message added',
          message_id: result.insertId,
        });
      }

  } catch (e) {
    console.error('message_post', e.message);
    next(httpError('Internal server error', 500));
  }
};

const message_put = async (req, res, next) => {
  try {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors.
      // Error messages can be returned in an array using `errors.array()`.
      console.error('message_put validation', errors.array());
      next(httpError('Invalid data', 400));
      return;
    }

    let data = [];

    if (req.user.role === 0) {
      data = [
        req.body.message_body,
        req.params.id,
      ];
    } else {
      data = [
        req.body.message_body,
        req.params.id,
        req.user.user_id,
      ];
    }

    console.log('message_put', data);

    const result = await updateMessage(data, req.user, next);
    if (result.affectedRows < 1) {
      next(httpError('No message modified', 400));
      return;
    }

    res.json({
      message: 'message modified',
    });
  } catch (e) {
    console.error('message_put', e.message);
    next(httpError('Internal server error', 500));
  }
};

const message_delete = async (req, res, next) => {
  console.log(req.params.id, req.user);
  try {
    const result = await deleteMessage(req.params.id, req.user.user_id, next);
    console.log(result);
    if (result.affectedRows < 1) {
      next(httpError('No message deleted', 400));
      return;
    }
    res.json({
      message: 'message deleted',
    });
  } catch (e) {
    console.error('delete', e.message);
    next(httpError('Internal server error', 500));
  }
};

const message_like = async (req, res, next) => {
  try {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors.
      // Error messages can be returned in an array using `errors.array()`.
      console.error('message_like validation', errors.array());
      next(httpError('Invalid data', 400));
      return;
    }

    console.log('message_like', req.user, req.params.id);

    const data = [
      req.user.user_id,
      req.params.id,
    ];

    const result = await likeMessage(data, next);
    if (result.affectedRows < 1) {
      next(httpError('Invalid data', 400));
      return;
    }
    res.json({
      message: 'message liked',
      message_id: result.insertId,
    });

  } catch (e) {
    console.error('message_like', e.message);
    next(httpError('Internal server error', 500));
  }
};

module.exports = {
  message_list_get,
  message_get,
  message_post,
  message_put,
  message_delete,
  message_like,
};