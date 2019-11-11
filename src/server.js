import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import Youch from 'youch';
import * as Sentry from '@sentry/node';
import 'express-async-errors';

import routes from './routes';
import sentryConfig from './config/sentry';
import RedisService from './app/services/RedisService';

import './database';

const socketio = require('socket.io');
const http = require('http');

const app = express();
const server = http.Server(app);
const io = socketio(server);

io.on('connection', async socket => {
  const { user_id } = socket.handshake.query;

  await RedisService.store(user_id, socket.id);

  socket.on('disconnect', async () => {
    await RedisService.delete(user_id, socket.id);
  });
});

app.use(async (req, res, next) => {
  req.io = io;

  const { user_id } = req.headers;
  if (user_id) {
    req.connectedUsers = await RedisService.index(user_id);
  }

  return next();
});

Sentry.init(sentryConfig);

app.use(Sentry.Handlers.requestHandler());
app.use(cors()); // em ambiente de produção = app.use(cors({ origin: 'http://seu-dominio.com.br' }));
app.use(express.json());

app.use(routes);
app.use(Sentry.Handlers.errorHandler());

app.use(async (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const errors = await new Youch(err, req).toJSON();

    return res.status(500).json(errors);
  }

  return res.status(500).json({ error: 'Internal server error' });
});

server.listen(3310);
