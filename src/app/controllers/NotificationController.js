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

  async store(req, res) {
    const schema = Yup.object().shape({
      mensagem: Yup.string().required(),
      // userId: Yup.number().required(),
    });

    const { user_id } = req.headers; // pessoa conectana no socket

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { mensagem } = req.body;

    if (user_id) {
      const users = req.connectedUsers;

      users.forEach(socket => {
        if (!req.io.sockets.connected[socket]) {
          RedisService.delete(user_id, socket);
        } else {
          req.io.to(socket).emit('notification', mensagem);
        }
      });
    }

    await Notification.create({
      content: mensagem,
      user: user_id,
    });

    return res.json('Create notification');
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    return res.json(notification);
  }
}

export default new NotificationController();
