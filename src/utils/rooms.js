'use strict';

const rooms = [];

const addRoom = room => {
  rooms.push({ room: room });
};

const removeRoom = removedRoom => {
  const index = rooms.findIndex(room => room.room === removedRoom);

  if (index !== -1) {
    return rooms.splice(index, 1)[0];
  }
};

const getRooms = () => {
  const uniqueRooms = [];

  rooms.forEach(({ room }) => {
    uniqueRooms.push(room);
  });

  return [...new Set(uniqueRooms)].map(room => ({ room }));
};

module.exports = { addRoom, removeRoom, getRooms };
