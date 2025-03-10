'use strict';

const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages.js');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users.js');
const { addRoom, removeRoom, getRooms } = require('./utils/rooms.js');

const port = process.env.PORT;
const publicDirectoryPath = path.join(__dirname, '../public');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDirectoryPath));

io.on('connection', socket => {
  io.emit('activeRooms', { rooms: getRooms() });

  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    addRoom(user.room);

    io.emit('activeRooms', { rooms: getRooms() });

    socket.join(user.room);

    socket.emit('message', generateMessage('Admin', 'Welcome!'));

    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage('Admin', `${user.username} has joined!`)
      );

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    if (user) {
      const filter = new Filter();

      if (filter.isProfane(message)) {
        return callback('Profanity is not allowed!');
      }

      io.to(user.room).emit('message', generateMessage(user.username, message));
    }

    callback();
  });

  socket.on('sendLocation', ({ latitude, longitude }, callback) => {
    const user = getUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'locationMessage',
        generateLocationMessage(
          user.username,
          `https://google.com/maps?q=${latitude},${longitude})`
        )
      );
    }

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      removeRoom(user.room);

      io.emit('activeRooms', { rooms: getRooms() });

      io.to(user.room).emit(
        'message',
        generateMessage('Admin', `${user.username} has left!`)
      );

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => console.log(`Server is up on port ${port}`));
