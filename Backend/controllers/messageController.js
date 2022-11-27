'use strict';
const {getAllMessages, getMessage, addMessage, updateMessage, deleteMessage,} = require(
    '../models/messageModel');
const {httpError} = require('../utils/errors');
const {validationResult} = require('express-validator');
const sharp = require('sharp');
const {getCoordinates} = require('../utils/imageMeta');

const message_list_get = async (req, res, next) => {
  try {
    const kissat = await getAllMessages(next);
    if (kissat.length < 1) {
      next(httpError('No messages found', 404));
      return;
    }
    res.json(kissat);
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

    console.log('message_post', req.body, req.file);

    const thumbnail = await sharp(req.file.path).
        resize(160, 160).
        png().
        toFile('./thumbnails/' + req.file.filename);

    const coords = await getCoordinates(req.file.path);

    const data = [
      req.body.name,
      req.body.birthdate,
      req.body.weight,
      req.user.user_id,
      req.file.filename,
      JSON.stringify(coords),
    ];

    const result = await addMessage(data, next);
    if (result.affectedRows < 1) {
      next(httpError('Invalid data', 400));
      return;
    }
    if(thumbnail) {
      res.json({
        message: 'message added',
        cat_id: result.insertId,
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
        req.body.name,
        req.body.birthdate,
        req.body.weight,
        req.body.owner,
        req.params.id,
      ];
    } else {
      data = [
        req.body.name,
        req.body.birthdate,
        req.body.weight,
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
  try {
    const result = await deleteMessage(req.params.id, req.user, next);
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

module.exports = {
  message_list_get,
  message_get,
  message_post,
  message_put,
  message_delete,
};