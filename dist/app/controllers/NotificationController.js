"use strict"; function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }Object.defineProperty(exports, "__esModule", {value: true});var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _Notification = require('../schemas/Notification'); var _Notification2 = _interopRequireDefault(_Notification);
var _RedisService = require('../services/RedisService'); var _RedisService2 = _interopRequireDefault(_RedisService);

class NotificationController {
  async index(req, res) {
    const { user_id } = req.headers;

    const notifications = await _Notification2.default.find({
      user: user_id,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      mensagem: Yup.string().required(),
      // userId: Yup.number().required(),
    });

    const { user_id } = req.headers; // pessoa conectana no socket

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { mensagem, data } = req.body;

    let parseJson = null;
    if (data) parseJson = JSON.parse(data);

    const response = await _Notification2.default.create({
      content: mensagem,
      user: user_id,
      data: parseJson,
    });

    if (user_id) {
      const users = req.connectedUsers;

      users.forEach(socket => {
        if (!req.io.sockets.connected[socket]) {
          _RedisService2.default.delete(user_id, socket);
        } else {
          req.io.to(socket).emit('notification', response);
        }
      });
    }

    return res.json(response);
  }

  async update(req, res) {
    const notification = await _Notification2.default.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    return res.json(notification);
  }
}

exports. default = new NotificationController();
