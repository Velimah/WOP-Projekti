'use strict';
const express = require('express');
const {user_list_get, user_get, user_put, user_delete, check_token} = require(
    '../controllers/userController');
const {body} = require("express-validator");
const router = express.Router();

router.route('/').
    get(user_list_get).
    put(body('name').isLength({min: 3}).escape(),
        body('email').isEmail(),
        body('password').matches(/(?=.*\p{Lu}).{8,}/u),user_put);

router.get('/token', check_token);

router.route('/:id').get(user_get).delete(user_delete);


module.exports = router;
