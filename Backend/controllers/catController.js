'use strict';
// catController
const {getCat, getAllCats, addCat, updateCat, deleteCat} = require(
    '../models/catModel');
const {httpError} = require('../utils/errors');
const {validationResult} = require('express-validator');
const sharp = require('sharp');
const {getCoordinates} = require('../utils/imageMeta');

const cat_list_get = async (req, res, next) => {
  try {
    const kissat = await getAllCats(next);
    if (kissat.length < 1) {
      next(httpError('No cats found', 404));
      return;
    }
    res.json(kissat);
  } catch (e) {
    console.error('cat_list_get', e.message);
    next(httpError('Internal server error', 500));
  }
};

const cat_get = async (req, res, next) => {
  try {
    const cat = await getCat(req.params.id, next);
    if (cat.length < 1) {
      next(httpError('No cat found', 404));
      return;
    }
    res.json(cat.pop());
  } catch (e) {
    console.error('cat_get', e.message);
    next(httpError('Internal server error', 500));
  }
};

const cat_post = async (req, res, next) => {
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

    console.log('cat_post', req.body, req.file);

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

    const result = await addCat(data, next);
    if (result.affectedRows < 1) {
      next(httpError('Invalid data', 400));
      return;
    }
    if(thumbnail) {
      res.json({
        message: 'cat added',
        cat_id: result.insertId,
      });
    }
  } catch (e) {
    console.error('cat_post', e.message);
    next(httpError('Internal server error', 500));
  }
};

const cat_put = async (req, res, next) => {
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

    let data = [];

    if (req.user.role === 0) {
      data = [
        req.body.name,
        req.body.birthdate,
        req.body.weight,
        req.body.owner,
        req.body.id,
      ];
    } else {
      data = [
        req.body.name,
        req.body.birthdate,
        req.body.weight,
        req.body.id,
        req.user.user_id,
      ];
    }

    console.log('cat_put', data);

    const result = await updateCat(data, req.user, next);
    if (result.affectedRows < 1) {
      next(httpError('No cat modified', 400));
      return;
    }

    res.json({
      message: 'cat modified',
    });
  } catch (e) {
    console.error('cat_put', e.message);
    next(httpError('Internal server error', 500));
  }
};

const cat_delete = async (req, res, next) => {
  try {
    const result = await deleteCat(req.params.id, req.user, next);
    if (result.affectedRows < 1) {
      next(httpError('No cat deleted', 400));
      return;
    }
    res.json({
      message: 'cat deleted',
    });
  } catch (e) {
    console.error('delete', e.message);
    next(httpError('Internal server error', 500));
  }
};

module.exports = {
  cat_list_get,
  cat_get,
  cat_post,
  cat_put,
  cat_delete,
};