const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when new user connects
io.on("connection", (socket) => {
    // Listen emitted text from user and log them
    socket.on('chatText', (text) => {
        console.log(text);
    });
  });

const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));