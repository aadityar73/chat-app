'use strict';

const socket = io();

// Elements
const $activeRooms = document.querySelector('#active-rooms');

// Templates
const activeRoomsTemplate = document.querySelector(
  '#active-rooms-template'
).innerHTML;

socket.on('activeRooms', ({ rooms }) => {
  const html = Mustache.render(activeRoomsTemplate, {
    rooms,
  });
  $activeRooms.innerHTML = html;
});

document.addEventListener('DOMContentLoaded', () => {
  const activeRoomsList = document.querySelector('#active-rooms');
  if (activeRoomsList) {
    activeRoomsList.addEventListener('click', e => {
      if (e.target.classList.contains('room-item')) {
        e.preventDefault();
        document.querySelector('#room-input').value = e.target.textContent;
      }
    });
  }
});
