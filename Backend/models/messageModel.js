'use strict';
const pool = require('../database/db');
const {httpError} = require('../utils/errors');
const promisePool = pool.promise();

const getAllMessages = async (next) => {
  try {
    const [rows] = await promisePool.execute(`SELECT message.message_id, message.user_id, message.board_id, message.reply_id, message.message_body, message.send_time, message.modify_time, message.picture, 
                                                         user.user_id AS sender, user.name, user.email, user.profile_picture, 
                                                         board.name AS boardname, 
                                                         (SELECT COUNT(likes.message_id) FROM likes WHERE likes.message_id=message.message_id) AS likecount,
                                                         replies.replycount
                                                              
                                                  FROM message
                                                  
                                                  JOIN user ON user.user_id = message.user_id
                                                  JOIN board ON board.board_id = message.board_id
                                                  LEFT JOIN replies ON message.message_id = replies.reply_id
                                                                                                            
                                                  ORDER BY send_time DESC;`);
    return rows;
  } catch (e) {
    console.error('getAllMessages', e.message);
    next(httpError('Database error getAllMessages', 500));
  }
};

const getMessage = async (messageId, next) => {
  try {
    const [rows] = await promisePool.execute(`SELECT message.message_id, message.user_id, message.board_id, message.reply_id, message.message_body, message.send_time, message.modify_time, message.picture, 
                                                         user.user_id AS sender, user.name, user.email, user.profile_picture, 
                                                         board.name AS boardname, 
                                                         (SELECT COUNT(likes.message_id) FROM likes WHERE likes.message_id=message.message_id) AS likecount,
                                                         replies.replycount
                                                              
                                                  FROM message
                                                  
                                                  JOIN user ON user.user_id = message.user_id
                                                  JOIN board ON board.board_id = message.board_id
                                                  LEFT JOIN replies ON message.message_id = replies.reply_id
                                                  
                                                  WHERE message.message_id = ?
                                                                                                            
                                                  ORDER BY send_time DESC;`, [messageId]);
    return rows;
  } catch (e) {
    console.error('getMessage', e.message);
    next(httpError('Database error getMessage', 500));
  }
};

const addMessage = async (data, next) => {
  try {
    const [rows] = await promisePool.execute(`INSERT INTO message (message_body, send_time, user_id, board_id, picture, coords) VALUES (?, now(), ?, ?, ?, ?);`,
      data);
    return rows;
  } catch (e) {
    console.error('addMessage', e.message);
    next(httpError('Database error addMessage', 500));
  }
};

const addReply = async (data, next) => {
  try {
    const [rows] = await promisePool.execute(`INSERT INTO message (message_body, send_time, user_id, board_id, picture, coords, reply_id) VALUES (?, NOW(), ?, ?, ?, ?, ?);`,
      data);
    return rows;
  } catch (e) {
    console.error('addReply', e.message);
    next(httpError('Database error addReply', 500));
  }
};


const updateMessage = async (data, user, next) => {
  try {
    if (user.role === 0) {
      const [rows] = await promisePool.execute(`UPDATE message SET message_body = ?, modify_time = NOW() WHERE message_id = ?;`,
        data);
      return rows;
    } else {
      const [rows] = await promisePool.execute(`UPDATE message SET message_body = ?, modify_time = NOW() WHERE message_id = ? AND user_id = ?;`,
        data);
      return rows;
    }

  } catch (e) {
    console.error('updateMessage', e.message);
    next(httpError('Database error updateMessage', 500));
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
    next(httpError('Database error deleteMessage', 500));
  }
};

const likeMessage = async (data, next) => {
  try {
    const [rows] = await promisePool.execute(`INSERT INTO likes (user_id, message_id) VALUES (?, ?);`,
      data);
    return rows;
  } catch (e) {
    console.error('likeMessage', e.message);
    next(httpError('Database error likeMessage. ALREADY LIKED?', 500));
  }
};

//Message Seach WIP
const searchMessage = async (MessageBody, next) => {
  try {
    const [rows] = await promisePool.execute(`SELECT message.message_id, message.user_id, message.board_id, message.message_body, message.send_time, message.modify_time, message.picture, 
                                                         user.user_id AS sender, user.name, user.email, user.profile_picture, 
                                                         board.name AS boardname, 
                                                         (SELECT COUNT(likes.message_id) FROM likes WHERE likes.message_id=message.message_id) AS likecount,
                                                         replies.replycount
                                                              
                                                  FROM message
                                                  
                                                  JOIN user ON user.user_id = message.user_id
                                                  JOIN board ON board.board_id = message.board_id
                                                  LEFT JOIN replies ON message.message_id = replies.reply_id
                                                  
                                                  WHERE message.message_body LIKE ?
                                                                                                            
                                                  ORDER BY send_time DESC;`,
      [MessageBody]);
    return rows;
  } catch (e) {
    console.error('searchMessage', e.message);
    next(httpError('Database error searchMessage', 500));
  }
};

const boardSelect = async (MessageBody, next) => {
  try {
    const [rows] = await promisePool.execute(`SELECT message.message_id, message.user_id, message.board_id, message.reply_id, message.message_body, message.send_time, message.modify_time, message.picture, 
                                                         user.user_id AS sender, user.name, user.email, user.profile_picture, 
                                                         board.name AS boardname, 
                                                         (SELECT COUNT(likes.message_id) FROM likes WHERE likes.message_id=message.message_id) AS likecount,
                                                         replies.replycount
                                                              
                                                  FROM message
                                                  
                                                  JOIN user ON user.user_id = message.user_id
                                                  JOIN board ON board.board_id = message.board_id
                                                  LEFT JOIN replies ON message.message_id = replies.reply_id
                                                  
                                                  WHERE message.board_id = ?
                                                                                                            
                                                  ORDER BY send_time DESC;`,
      [MessageBody]);
    return rows;
  } catch (e) {
    console.error('searchMessage', e.message);
    next(httpError('Database error searchMessage', 500));
  }
};

module.exports = {
  getAllMessages,
  getMessage,
  addMessage,
  updateMessage,
  deleteMessage,
  likeMessage,
  addReply,
  searchMessage,
  boardSelect,
};