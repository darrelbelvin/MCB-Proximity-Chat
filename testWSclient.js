const { WebSocket } = require('ws');
require('dotenv').config();

const ws = new WebSocket(process.env.SERVER_ADDRESS);

ws.on('open', function open() {
  ws.send(process.env.CLIENT_USERNAME);
});

ws.on('message', function message(data) {
  console.log('received: %s', data);
});