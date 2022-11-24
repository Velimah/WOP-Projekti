'use strict';
const jwt = require('jsonwebtoken');
const passport = require('passport');
const {httpError} = require('../utils/errors');
const {validationResult} = require('express-validator');
const {addUser} = require('../models/userModel');
const bcrypt = require('bcryptjs');

const login = (req, res, next) => {
  // TODO: add passport authenticate
  passport.authenticate('local', {session: false}, (err, user, info) => {
    console.log('info: ', info);
    console.log('err1: ', err);
    if (err || !user) {
      next(httpError('Kirjautumiserhe', 403));
      return;
    }
    req.login(user, {session: false}, (err) => {
      if (err) {
        console.log('err2: ', err);
        next(httpError('Kirjautmiserhe 2', 403));
        return;
      }
      const token = jwt.sign(user, 'tw34y5ktugijl');
      return res.json({user, token});
    });
  })(req, res, next);
};

const user_post = async (req, res, next) => {
  try {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors.
      // Error messages can be returned in an array using `errors.array()`.
      console.error('user_post validation', errors.array());
      next(httpError('Invalid data', 400));
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const pwd = bcrypt.hashSync(req.body.passwd, salt);

    const data = [
      req.body.name,
      req.body.email,
      pwd,
    ];

    const result = await addUser(data, next);
    if (result.affectedRows < 1) {
      next(httpError('Invalid data', 400));
      return;
    }

    res.json({
      message: 'user added',
      user_id: result.insertId,
    });
  } catch (e) {
    console.error('user_post', e.message);
    next(httpError('Internal server error', 500));
  }
};

module.exports = {
  login,
  user_post,
};