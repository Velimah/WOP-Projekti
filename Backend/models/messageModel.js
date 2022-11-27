'use strict';
const pool = require('../database/db');
const {httpError} = require('../utils/errors');
const promisePool = pool.promise();

const getAllMessages = async (next) => {
  try {
    const [rows] = await promisePool.execute(`SELECT cat_id, wop_cat.name, weight, owner, filename, birthdate, wop_user.name as ownername 
                                              FROM wop_cat 
                                              JOIN wop_user 
                                              ON wop_user.user_id = wop_cat.owner;`);
    return rows;
  } catch (e) {
    console.error('getAllMessages', e.message);
    next(httpError('Database error', 500));
  }
};

const getMessage = async (catId, next) => {
  try {
    const [rows] = await promisePool.execute(`SELECT cat_id, wop_cat.name, weight, owner, filename, birthdate, coords, wop_user.name as ownername 
                                              FROM wop_cat 
                                              JOIN wop_user 
                                              ON wop_user.user_id = wop_cat.owner 
                                              WHERE cat_id = ?;`, [catId]);
    return rows;
  } catch (e) {
    console.error('getMessage', e.message);
    next(httpError('Database error', 500));
  }
};

const addMessage = async (data, next) => {
  try {
    const [rows] = await promisePool.execute(`INSERT INTO wop_cat (name, birthdate, weight, owner, filename, coords) VALUES (?, ?, ?, ?, ?, ?);`,
        data);
    return rows;
  } catch (e) {
    console.error('addMessage', e.message);
    next(httpError('Database error', 500));
  }
};

const updateMessage = async (data, user, next) => {
  try {
    if(user.role === 0){
      const [rows] = await promisePool.execute(`UPDATE wop_cat SET name = ?, birthdate = ?, weight = ?, owner = ? WHERE cat_id = ?;`,
          data);
      return rows;
    } else {
      const [rows] = await promisePool.execute(`UPDATE wop_cat SET name = ?, birthdate = ?, weight = ? WHERE cat_id = ? AND owner = ?;`,
          data);
      return rows;
    }

  } catch (e) {
    console.error('updateMessage', e.message);
    next(httpError('Database error', 500));
  }
};

const deleteMessage = async (catId, user, next) => {
  try {
    let sql = 'DELETE FROM wop_cat where cat_id = ?';
    const params = [];
    if (user.role === 0) {
      params.push(catId);
    } else {
      sql += ' AND owner = ?;';
      params.push(catId, user.user_id);
    }
    const [rows] = await promisePool.execute(sql, params);
    return rows;
  } catch (e) {
    console.error('deleteMessage', e.message);
    next(httpError('Database error', 500));
  }
};

module.exports = {
  getAllMessages,
  getMessage,
  addMessage,
  updateMessage,
  deleteMessage,
};