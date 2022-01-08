const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { addUser, getUserList, getCurrentUser, userLeave } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when new user connects
io.on("connection", (socket) => {

  // Get username from user
  socket.on('userName', userName => {

    //Add user to userlist
    addUser(socket.id, userName);
  })

  // Send userlist to user
  socket.emit('userList', getUserList(socket.id));

  // Listen emitted text from user and log them
  socket.on('chatText', (text) => {
    const response = `Dear ${getCurrentUser(socket.id)},\nYour message has been received.`;
    console.log(text, getCurrentUser(socket.id));
    socket.emit('staticMessageFromServer', response);
  });

  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
  });
});

const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));