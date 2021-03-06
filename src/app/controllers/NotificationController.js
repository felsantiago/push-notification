import * as Yup from 'yup';
import Notification from '../schemas/Notification';
import RedisService from '../services/RedisService';

class NotificationController {
  async index(req, res) {
    const { user_id } = req.headers;

    const notifications = await Notification.find({
      user: user_id,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async show(req, res) {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (notification) return res.json(notification);

    return res.status(400).json({ message: 'Notification not found.' });
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

    const response = await Notification.create({
      content: mensagem,
      user: user_id,
      data: parseJson,
    });

    if (user_id) {
      const users = req.connectedUsers;

      users.forEach(socket => {
        if (!req.io.sockets.connected[socket]) {
          RedisService.delete(user_id, socket);
        } else {
          req.io.to(socket).emit('notification', response);
        }
      });
    }

    return res.json(response);
  }

  async patch(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (notification) return res.json(notification);

    return res.status(400).json({ message: 'Notification not found.' });
  }

  async update(req, res) {
    const { data } = req.body;
    const { mensagem } = req.body;

    let parseJson = null;
    if (data) parseJson = JSON.parse(data);

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      {
        content: mensagem,
        data: parseJson,
      }
    );

    if (notification) return res.json(notification);

    return res.status(400).json({ message: 'Notification not found.' });
  }
}

export default new NotificationController();
