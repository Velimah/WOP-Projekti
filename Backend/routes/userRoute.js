'use strict';
const express = require('express');
const {user_list_get, user_get, user_put, user_delete, check_token, user_picture_update} = require(
  '../controllers/userController');
const {body} = require("express-validator");
const multer = require('multer');
const {httpError} = require("../utils/errors");
const router = express.Router();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.includes('image')) {
    cb(null, true);
  } else {
    cb(httpError('Invalid file', 400));
  }
}

const upload = multer({dest: 'uploads/', fileFilter});

router.route('/').get(user_list_get).put(body('name').isLength({min: 1, max: 20}).escape(),
  body('email').isEmail(),
  body('password').matches(/(?=.*\p{Lu}).{8,}/u), user_put);

router.get('/token', check_token);

router.route('/:id').get(user_get).delete(user_delete);

router.route('/picture').post(upload.single('picture'), user_picture_update);

module.exports = router;
