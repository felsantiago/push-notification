"use strict"; function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }require('dotenv/config');

var _express = require('express'); var _express2 = _interopRequireDefault(_express);
var _cors = require('cors'); var _cors2 = _interopRequireDefault(_cors);
var _youch = require('youch'); var _youch2 = _interopRequireDefault(_youch);
var _node = require('@sentry/node'); var Sentry = _interopRequireWildcard(_node);
require('express-async-errors');

var _routes = require('./routes'); var _routes2 = _interopRequireDefault(_routes);
var _sentry = require('./config/sentry'); var _sentry2 = _interopRequireDefault(_sentry);
var _RedisService = require('./app/services/RedisService'); var _RedisService2 = _interopRequireDefault(_RedisService);

require('./database');

const socketio = require('socket.io');
const http = require('http');

const app = _express2.default.call(void 0, );
const server = http.Server(app);
const io = socketio(server);

io.on('connection', async socket => {
  const { user_id } = socket.handshake.query;

  await _RedisService2.default.store(user_id, socket.id);

  socket.on('disconnect', async () => {
    await _RedisService2.default.delete(user_id, socket.id);
  });
});

app.use(async (req, res, next) => {
  req.io = io;

  const { user_id } = req.headers;
  if (user_id) {
    req.connectedUsers = await _RedisService2.default.index(user_id);
  }

  return next();
});

Sentry.init(_sentry2.default);

app.use(Sentry.Handlers.requestHandler());
app.use(_cors2.default.call(void 0, )); // em ambiente de produção = app.use(cors({ origin: 'http://seu-dominio.com.br' }));
app.use(_express2.default.json());

app.use(_routes2.default);
app.use(Sentry.Handlers.errorHandler());

app.use(async (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const errors = await new (0, _youch2.default)(err, req).toJSON();

    return res.status(500).json(errors);
  }

  return res.status(500).json({ error: 'Internal server error' });
});

server.listen(3310);
