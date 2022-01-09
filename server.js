const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const moment = require('moment');
const { addUser, getUserList, getCurrentUser, getReceiverSocketId, userLeave } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when new user connects
io.on("connection", (socket) => {
  let currentUser = '';
  let connectedToAnotherUser = false;
  // Get username from user
  socket.on('userName', userName => {
    //Add user to userlist
    addUser(socket.id, userName);
    currentUser = userName;
  })

  // Send userlist to user
  socket.emit('userList', getUserList().filter(user => user.id !== socket.id));

  // Update userlist to other users
  setTimeout(() => {
    socket.broadcast.emit('updatedUserList', getUserList());
  }, 500);

  // Send welcome message to user
  socket.emit('welcomeMessage', 'Welcome to InstantChat!\nPlease select a user to start conversation.');

  socket.on('selectedReceiver', receiverName => {
    connectedToAnotherUser = receiverName;
  })

  // Listen emitted text from user and log them
  socket.on('chatText', text => {
    if(!connectedToAnotherUser){
      const response = `Dear ${currentUser},\nPlease select a user to start conversation.`;
      socket.emit('staticMessageFromServer', response);
    } else {
      io.to(getReceiverSocketId(connectedToAnotherUser)).emit('message', `${currentUser} ${moment().format('h:mm a')}\n ${text}`);
    }
  });

  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
  });
});

const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));