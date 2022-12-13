'use strict';
const express = require('express');
const {body} = require('express-validator');
const {httpError} = require('../utils/errors');
const multer = require('multer');

const fileFilter = (req, file, cb) => {
  if (file.mimetype.includes('image')) {
    cb(null, true);
  } else {
    cb(httpError('Invalid file', 400));
  }
}

const upload = multer({dest: 'uploads/', fileFilter});

const {
  message_list_get, message_get, message_post, message_reply, message_put, message_delete, message_like,
  message_search, board_select
} = require(
  '../controllers/messageController');
const router = express.Router();


router.route('/')
  .get(message_list_get)
  .post(upload.single('picture'),
    body('message_body').isLength({min: 1}).escape(),
    message_post);

router.route('/search').post(body('message_body').isLength({min: 1}).escape(),message_search);

router.route('/board').post(body('board_id').isNumeric().isLength({max: 1}),board_select);

router.route('/like/:id').post(message_like);

router.route('/:id')
  .get(message_get)
  .delete(message_delete)
  .put(body('message_body').isLength({min: 1}).escape(),
  message_put)
  .post(upload.single('picture'),
  body('message_body').isLength({min: 1}).escape(),
  message_reply);


module.exports = router;
