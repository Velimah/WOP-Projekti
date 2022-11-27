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
const {message_list_get, message_get, message_post, message_put, message_delete} = require(
    '../controllers/messageController');
const router = express.Router();


router.route('/').
    get(message_list_get).
    post(upload.single('cat'),
        body('name').isLength({min: 1}).escape(),
        body('birthdate').isDate(),
        body('weight').isNumeric(),
        message_post);

router.route('/:id').
    get(message_get).
    delete(message_delete).
    put(body('name').isLength({min: 1}).escape(),
        body('birthdate').isDate(),
        body('weight').isNumeric(),
        message_put);

module.exports = router;
