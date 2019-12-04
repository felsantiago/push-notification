FROM node:10

RUN mkdir -p /home/node/push-notification/node_modules && chown -R node:node /home/node/push-notification

WORKDIR /dist

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3310

CMD [ "yarn", "start" ]
