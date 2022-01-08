const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');

// Get username from URL
const {username} = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Send userName to server
socket.emit('userName', username);
// console.log(username);

// Get active user list from server
socket.on('userList', users => {
  if(users.length === 0){
    console.log('No active users here');
  }
  else{
    outputUsers(users);
  }
});

// Handle messages from user
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
    // Get message text
    let text = e.target.elements.msg.value;
  
    text = text.trim();
  
    if (!text) {
      return false;
    }
  
    // Emit message to server
    socket.emit('chatText', text);
  
    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
  });

  // Listen message from server
  socket.on('staticMessageFromServer', response => {
    outputMessage(response);
  });

  // Add active users to DOM
  function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
      const li = document.createElement('li');
      li.innerText = user.username;
      userList.appendChild(li);
    });
  }

  // Output message to DOM
  function outputMessage(response) {
    const p = document.createElement('p');
    p.classList.add('message');
    p.innerText = response;
    chatMessages.appendChild(p);
  }