'use strict';
const pool = require('../database/db');
const {httpError} = require('../utils/errors');
const promisePool = pool.promise();

const getAllUsers = async (next) => {
  try {
    const [rows] = await promisePool.execute(`SELECT user_id, name, email, role FROM user;`);
    return rows;
  } catch (e) {
    console.error('getAllUsers', e.message);
    next(httpError('Database error', 500));
  }
};

const getUser = async (userId, next) => {
  try {
    const [rows] = await promisePool.execute(`SELECT user_id, name, email, role FROM user WHERE user_id = ?;`, [userId]);
    return rows;

  } catch (e) {
    console.error('getUser', e.message);
    next(httpError('Database error', 500));
  }
};

const addUser = async (data, next) => {
  try {
    const [rows] = await promisePool.execute(`INSERT INTO user (name, email, password) VALUES (?, ?, ?);`,
      data);
    return rows;
  } catch (e) {
    console.error('addUser', e.message);
    next(httpError('Database error', 500));
  }
};

const addProfilePic = async (data, next) => {
  try {
    const [rows] = await promisePool.execute(`UPDATE user SET user.profile_picture = ? WHERE user.user_id =?;`,
      data);
    return rows;
  } catch (e) {
    console.error('addProfilePic', e.message);
    next(httpError('Database error', 500));
  }
};

const updateUser = async (data, next) => {
  try {
    const [rows] = await promisePool.execute(`UPDATE user set name = ?, email = ?, password = ? WHERE user_id = ?;`,
      data);
    return rows;
  } catch (e) {
    console.error('updateUser', e.message);
    next(httpError('Database error', 500));
  }
};

//not in use, needs to delete messages and replies attached to user as well
const deleteUser = async (userId, next) => {
  try {
    const [rows] = await promisePool.execute(`DELETE FROM user where user_id = ?;`,
      [userId]);
    return rows;
  } catch (e) {
    console.error('deleteUser', e.message);
    next(httpError('Database error', 500));
  }
};

const getUserLogin = async (params, next) => {
  try {
    const [rows] = await promisePool.execute(
      'SELECT * FROM user WHERE email = ?;',
      params);
    return rows;
  } catch (e) {
    console.error('getUserLogin', e.message);
    next(httpError('Database error', 500));
  }
};

module.exports = {
  getAllUsers,
  getUser,
  addUser,
  addProfilePic,
  updateUser,
  deleteUser,
  getUserLogin,
};