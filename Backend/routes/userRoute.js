'use strict';
const express = require('express');
const {user_list_get, user_get, user_put, user_delete, check_token} = require(
    '../controllers/userController');
const router = express.Router();

router.route('/').
    get(user_list_get).
    put(user_put);

router.get('/token', check_token);

router.route('/:id').get(user_get).delete(user_delete);


module.exports = router;
