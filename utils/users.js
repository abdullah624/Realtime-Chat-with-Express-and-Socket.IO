const users = [];

// Add user to userlist
function addUser(id, username) {
  const user = { id, username };

  users.push(user);
}

// Get active user list
function getUserList(id) {
    let tempList = [...users].filter(user => id != user.id);
    return tempList;
}

// Remove user from user list when disconnect
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);
  
    if (index !== -1) {
      users.splice(index, 1);
    }
  }

module.exports = { addUser, getUserList, userLeave };