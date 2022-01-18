const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const moment = require("moment");
const {
  addUser,
  getUserList,
  getCurrentUser,
  getReceiverSocketId,
  userLeave,
  joinGroup,
} = require("./utils/users");
const formatMessage = require("./utils/messages");
const { group } = require("console");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Run when new user connects
io.on("connection", (socket) => {
  let currentUser = "";
  let receiver = { name: "", id: "" };
  let group = '';
  // Get username from user
  socket.on("userName", (userName) => {
    //Add user to userlist
    addUser(socket.id, userName);
    currentUser = userName;
  });

  // Group

  socket.on("joinGroup", ({ username, groupName }) => {
    const user = joinGroup(socket.id, username, groupName);
    group = groupName;

    socket.join(user.groupName);

    // Welcome current user
    socket.emit("welcomeToGroup", {
      message: formatMessage(
        "Server",
        `Welcome to \\B\\blue${user.groupName}\\blue\\B!`
      ),
      user,
    });

    // Broadcast when a user connects
    socket.broadcast
      .to(user.groupName)
      .emit(
        "broadcastMessageOnJoin",
        formatMessage(
          "Server",
          `\\B\\blue${user.username}\\blue\\B has joined the group.`
        )
      );

    // Send message to group members
    socket.on("groupChatText", (text) => {
      socket.broadcast
        .to(user.groupName)
        .emit("groupMessage", formatMessage(user.username, text));
    });

    // Leave a member from group
    socket.on("leaveGroup", ({ username, groupName }) => {
      socket.broadcast
        .to(groupName)
        .emit(
          "broadcastMessageOnLeave",
          formatMessage(
            "Server",
            `\\B\\blue${username}\\blue\\B \\redhas left the group.\\red`
          )
        );
        // group = '';
      socket.leave(groupName, err => console.log(err));
    });
  });

  ///

  // Send userlist to user
  socket.emit(
    "userList",
    getUserList().filter((user) => user.id !== socket.id)
  );

  // Update userlist to other users
  setTimeout(() => {
    socket.broadcast.emit("updatedUserList", getUserList());
  }, 500);

  // Send welcome message to user
  socket.emit(
    "welcomeMessage",
    formatMessage("Server", "Please select a user to start conversation.")
  );

  // Get receiver name
  socket.on("receiverSelection", (user) => {
    if (
      !receiver.name ||
      (receiver.name === user.name && receiver.id === user.id)
    ) {
      receiver.name = user.name;
      receiver.id = user.id;
    } else {
      socket.emit("receiverDeselection", {
        name: receiver.name,
        id: receiver.id,
      });
      receiver.name = user.name;
      receiver.id = user.id;
    }
  });

  // Listen emitted text from sender and emit them to receiver
  socket.on("chatText", (text) => {
    if (!receiver.id) {
      socket.emit(
        "staticMessageFromServer",
        formatMessage("Server", "Please select a user to start conversation.")
      );
    } else {
      try {
        io.to(receiver.id).emit(
          "message",
          formatMessage(`${currentUser}`, `${text}`, socket.id)
        );
      } catch (e) {
        socket.emit(
          "staticMessageFromServer",
          formatMessage("Server", `${receiver.name} has left.`)
        );
      }
    }
  });

  // Run when user disconnect
  socket.on("disconnect", () => {
    socket.broadcast
        .to(group)
        .emit(
          "broadcastMessageOnLeave",
          formatMessage(
            "Server",
            `\\B\\blue${currentUser}\\blue\\B \\redhas left the group.\\red`
          )
        );
    socket.leave(group, err => console.log(err));
    const user = userLeave(socket.id);
    socket.broadcast.emit("updatedUserList", getUserList(), user);
    group = '';
    receiver.name = "";
    receiver.id = "";
  });
});

const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
