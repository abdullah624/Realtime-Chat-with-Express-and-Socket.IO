const users = [];

// Add user to userlist
function addUser(id, username) {
  const user = { id, username };

  users.push(user);
}

// Get active user list
function getUserList() {
  let tempList = [...users];
  return tempList;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id).username;
}

// Get receiver socket id
function getReceiverSocketId(receiverName) {
  return users.find(user => user.username === receiverName).id;
}

// Remove user from user list when disconnect
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    users.splice(index, 1);
  }
}

module.exports = { addUser, getUserList, getCurrentUser, getReceiverSocketId, userLeave };