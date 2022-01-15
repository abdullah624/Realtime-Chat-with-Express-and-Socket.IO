const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const moment = require('moment');
const { addUser, getUserList, getCurrentUser, getReceiverSocketId, userLeave } = require('./utils/users');
const formatMessage = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when new user connects
io.on("connection", (socket) => {
  let currentUser = '';
  let receiver = {name: '', id: ''};
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
  socket.emit('welcomeMessage', formatMessage('Server', 'Please select a user to start conversation.') );

  // Get receiver name
  socket.on('receiverSelection', (user) => {
    if(!receiver.name || (receiver.name === user.name && receiver.id === user.id)){
      receiver.name = user.name;
      receiver.id = user.id;
    }
    else{
      socket.emit('receiverDeselection', {name: receiver.name, id: receiver.id});
      receiver.name = user.name;
      receiver.id = user.id;
    }
  });

  // Listen emitted text from sender and emit them to receiver
  socket.on('chatText', text => {
    if(!receiver.id){
      socket.emit('staticMessageFromServer', formatMessage('Server', 'Please select a user to start conversation.'));
    } else {
      try {
        io.to(receiver.id).emit('message', formatMessage(`${currentUser}`, `${text}`, socket.id));
      } catch(e) {
        socket.emit('staticMessageFromServer', formatMessage('Server', `${receiver.name} has left.`));
      }
    }
  });

  // Run when user disconnect
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    socket.broadcast.emit('updatedUserList', getUserList(), user);
    receiver.name = '';
    receiver.id = '';
  });
});

const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));