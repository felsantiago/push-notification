import { Router } from 'express';

import NotificationController from './app/controllers/NotificationController';

const routes = new Router();

routes.get('/', (req, res) => {
  return res.json({ message: 'World' });
});

routes.get('/notifications', NotificationController.index);
routes.post('/notifications', NotificationController.store);
routes.put('/notifications/:id', NotificationController.update);

export default routes;
