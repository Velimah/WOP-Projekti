'use strict';
const {
  getAllMessages,
  getMessage,
  addMessage,
  addReply,
  updateMessage,
  deleteMessage,
  likeMessage,
  searchMessage,
  boardSelect
} = require(
  '../models/messageModel');
const {httpError} = require('../utils/errors');
const {validationResult} = require('express-validator');
const sharp = require('sharp');
const {getCoordinates} = require('../utils/imageMeta');

// gets all messages
const message_list_get = async (req, res, next) => {
  try {
    const messages = await getAllMessages(next);
    if (messages.length < 1) {
      next(httpError('Ei löytynyt viestejä', 404));
      return;
    }
    res.json(messages);
  } catch (e) {
    console.error('message_list_get', e.message);
    next(httpError('Internal server error', 500));
  }
};

//gets a single message with params.id
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

// posts a message
const message_post = async (req, res, next) => {
  try {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors.
      // Error messages can be returned in an array using `errors.array()`.
      console.error('message_post validation', errors.array());
      next(httpError('Tiedot väärin', 400));
      return;
    }

    // checks if there is an image
    if (req.file !== undefined) {

      const thumbnail = await sharp(req.file.path).withMetadata().rotate().resize(560, 300).png().toFile('./thumbnails/' + req.file.filename);

      const coords = await getCoordinates(req.file.path);

      const data = [
        req.body.message_body,
        req.user.user_id,
        req.body.board_id,
        req.file.filename,
        JSON.stringify(coords),
      ];


      const result = await addMessage(data, next);
      if (result.affectedRows < 1) {
        next(httpError('Tiedot väärin', 400));
        return;
      }
      if (thumbnail) {
        res.json({
          message: 'Viesti lähetetty',
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
        next(httpError('Tiedot väärin', 400));
        return;
      }
      res.json({
        message: 'Viesti lähetetty',
        message_id: result.insertId,
      });
    }

  } catch (e) {
    console.error('message_post', e.message);
    next(httpError('Internal server error', 500));
  }
};

// posts reply to a message with params.id
const message_reply = async (req, res, next) => {
  try {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors.
      // Error messages can be returned in an array using `errors.array()`.
      console.error('message_reply validation', errors.array());
      next(httpError('Tiedot väärin', 400));
      return;
    }

    //checks if there is an image
    if (req.file !== undefined) {

      const thumbnail = await sharp(req.file.path).withMetadata().rotate().resize(560, 300).png().toFile('./thumbnails/' + req.file.filename);

      const coords = await getCoordinates(req.file.path);

      const data = [
        req.body.message_body,
        req.user.user_id,
        parseInt(req.body.board_id),
        req.file.filename,
        JSON.stringify(coords),
        req.params.id,
      ];

      const result = await addReply(data, next);
      if (result.affectedRows < 1) {
        next(httpError('Tiedot väärin', 400));
        return;
      }
      if (thumbnail) {
        res.json({
          message: 'Viestiin vastattu',
          message_id: result.insertId,
        });
      }

    } else {

      const data = [
        req.body.message_body,
        req.user.user_id,
        parseInt(req.body.board_id),
        "",
        "[24.74,60.24]",
        req.params.id,
      ];

      const result = await addReply(data, next);
      if (result.affectedRows < 1) {
        next(httpError('Tiedot väärin', 400));
        return;
      }
      res.json({
        message: 'Viestiin vastattu',
        message_id: result.insertId,
      });
    }

  } catch (e) {
    console.error('message_reply', e.message);
    next(httpError('Internal server error', 500));
  }
};

// edits message
const message_put = async (req, res, next) => {
  try {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors.
      // Error messages can be returned in an array using `errors.array()`.
      console.error('message_put validation', errors.array());
      next(httpError('Tiedot väärin', 400));
      return;
    }

    let data;

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

    const result = await updateMessage(data, req.user, next);
    if (result.affectedRows < 1) {
      next(httpError('Viestiä ei muokattu', 400));
      return;
    }

    res.json({
      message: 'Viestiä muokattu',
    });
  } catch (e) {
    console.error('message_put', e.message);
    next(httpError('Internal server error', 500));
  }
};

// deletes message
const message_delete = async (req, res, next) => {
  try {

    let data;

    if (req.user.role === 0) {
      data = [
        req.params.id,
        req.params.id,
      ];
    } else {
      data = [
        req.params.id,
        req.params.id,
        req.user.user_id,
      ];
    }

      const result = await deleteMessage(data, req.user, next);
      if (result.affectedRows < 1) {
        next(httpError('Viestiä ei poistettu', 400));
        return;
      }

    res.json({
      message: 'Viesti poistettu',
    });
  } catch (e) {
    console.error('delete', e.message);
    next(httpError('Internal server error', 500));
  }
};

// likes a message
const message_like = async (req, res, next) => {
  try {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors.
      // Error messages can be returned in an array using `errors.array()`.
      console.error('message_like validation', errors.array());
      next(httpError('Tiedot väärin', 400));
      return;
    }

    const data = [
      req.user.user_id,
      req.params.id,
    ];

    const result = await likeMessage(data, next);
    console.log(result);
    if (result.affectedRows < 1) {
      next(httpError('Tiedot väärin', 400));
      return;
    }
    res.json({
      message: 'Tykkäys tallennettu',
      message_id: result.insertId,
    });

  } catch (e) {
    console.error('message_like', e.message);
    next(httpError('Internal server error', 500));
  }
};

const message_search = async (req, res, next) => {
  try {
    const messages = await searchMessage(`%${req.body.message_body}%`, next);
    if (messages.length < 1) {
      next(httpError('Ei löytynyt viestejä', 404));
      return;
    }
    res.json(messages);
  } catch (e) {
    console.error('message_search', e.message);
    next(httpError('Internal server error', 500));
  }
};

const board_select = async (req, res, next) => {
  try {
    const messages = await boardSelect(req.body.board_id, next);
    if (messages.length < 1) {
      next(httpError('Ei löytynyt viestialuetta', 404));
      return;
    }
    res.json(messages);
  } catch (e) {
    console.error('board_select', e.message);
    next(httpError('Internal server error', 500));
  }
};


module.exports = {
  message_list_get,
  message_get,
  message_post,
  message_reply,
  message_put,
  message_delete,
  message_like,
  message_search,
  board_select,
};