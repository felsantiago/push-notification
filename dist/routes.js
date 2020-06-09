"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }Object.defineProperty(exports, "__esModule", {value: true});var _express = require('express');

var _NotificationController = require('./app/controllers/NotificationController'); var _NotificationController2 = _interopRequireDefault(_NotificationController);

const routes = new (0, _express.Router)();

routes.get('/', (req, res) => {
  return res.json({ message: 'World' });
});

routes.get('/notifications', _NotificationController2.default.index);
routes.get('/notifications/:id', _NotificationController2.default.show);
routes.post('/notifications', _NotificationController2.default.store);
routes.patch('/notifications/:id', _NotificationController2.default.patch);
routes.put('/notifications/:id', _NotificationController2.default.update);

exports. default = routes;
