import { Router } from 'express';

import NotificationController from './app/controllers/NotificationController';

const routes = new Router();

routes.get('/', (req, res) => {
  return res.json({ message: 'World' });
});

routes.get('/notifications', NotificationController.index);
routes.get('/notifications/:id', NotificationController.show);
routes.post('/notifications', NotificationController.store);
routes.patch('/notifications/:id', NotificationController.patch);
routes.put('/notifications/:id', NotificationController.update);

export default routes;
