'use strict';
const pool = require('../database/db');
const {httpError} = require('../utils/errors');
const promisePool = pool.promise();

const getAllMessages = async (next) => {
  try {
    const [rows] = await promisePool.execute(`SELECT message.message_id, message.user_id, message.board_id, message.message_body, message.send_time, message.picture, user.user_id AS sender, user.name, user.email, board.name AS boardname, 
                                                 (SELECT COUNT(likes.message_id) FROM likes WHERE likes.message_id=message.message_id) AS likecount                                 
                                                  FROM message, user, board
                                                  WHERE user.user_id = message.user_id AND board.board_id = message.board_id
                                                  ORDER BY send_time DESC;`);
    return rows;
  } catch (e) {
    console.error('getAllMessages', e.message);
    next(httpError('Database error', 500));
  }
};


const getMessage = async (messageId, next) => {
  try {
    const [rows] = await promisePool.execute(`SELECT message_id, message.message_body, picture, user.name as sender 
                                              FROM message
                                              JOIN user 
                                              ON user.user_id = message.user_id 
                                              WHERE message_id = ?;`, [messageId]);
    return rows;
  } catch (e) {
    console.error('getMessage', e.message);
    next(httpError('Database error', 500));
  }
};

const addMessage = async (data, next) => {
  try {
    const [rows] = await promisePool.execute(`INSERT INTO message (message_body, send_time, user_id, board_id, picture) VALUES (?, now(), ?, ?, ?);`,
      data);
    return rows;
  } catch (e) {
    console.error('addMessage', e.message);
    next(httpError('Database error', 500));
  }
};

const updateMessage = async (data, user, next) => {
  try {
    if (user.role === 0) {
      const [rows] = await promisePool.execute(`UPDATE message SET message_body = ? WHERE message_id = ?;`,
        data);
      return rows;
    } else {
      const [rows] = await promisePool.execute(`UPDATE message SET message_body = ? WHERE message_id = ? AND user_id = ?;`,
        data);
      return rows;
    }

  } catch (e) {
    console.error('updateMessage', e.message);
    next(httpError('Database error', 500));
  }
};

const deleteMessage = async (messageId, user, next) => {
  try {
   // if (user.role === 0) {
      const [rows] = await promisePool.execute(`DELETE FROM message WHERE message.message_id = ?;`,
        [messageId]);
      return rows;
   /* } else {
      const [rows] = await promisePool.execute(`DELETE FROM message WHERE message.message_id = ? AND message.user_id = ?;`,
        [messageId, user]);
      return rows;
    }
*/
  } catch (e) {
    console.error('deleteMessage', e.message);
    next(httpError('Database error', 500));
  }
};

const likeMessage = async (data, next) => {
  try {
    const [rows] = await promisePool.execute(`INSERT INTO likes (user_id, message_id) VALUES (?, ?);`,
      data);
    return rows;
  } catch (e) {
    console.error('likeMessage', e.message);
    next(httpError('ALREADY LIKED?', 500));
  }
};

module.exports = {
  getAllMessages,
  getMessage,
  addMessage,
  updateMessage,
  deleteMessage,
  likeMessage,
};