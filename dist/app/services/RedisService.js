"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }Object.defineProperty(exports, "__esModule", {value: true});var _redis = require('redis'); var _redis2 = _interopRequireDefault(_redis);
var _redis3 = require('../../config/redis'); var _redis4 = _interopRequireDefault(_redis3);

const client = _redis2.default.createClient(_redis4.default);

client.on('connect', () => {});

const getAllListKey = id => {
  return new Promise((resolve, reject) => {
    client.LRANGE(`user:${id}`, 0, -1, (err, value) => {
      if (err) {
        reject(err);
      } else {
        resolve(value);
      }
    });
  });
};

const deleteListKey = (id, socketId) => {
  return new Promise((resolve, reject) => {
    client.LREM(`user:${id}`, -1, socketId, err => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

const createListKey = (id, socketId) => {
  return new Promise((resolve, reject) => {
    client.LPUSH(`user:${id}`, socketId, e => {
      if (e) {
        reject(e);
      } else {
        resolve(true);
      }
    });
  });
};

class RedisService {
  async index(id) {
    const value = await getAllListKey(id);

    return value;
  }

  async store(id, socketId) {
    await createListKey(id, socketId);
  }

  async delete(id, socketId) {
    await deleteListKey(id, socketId);
  }
}

exports. default = new RedisService();
