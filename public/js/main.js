const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
// const selectedUser = document.querySelector('.user') ;

// Get username from URL
const {username} = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

function clickHandler (e) {
  console.log(e);
}

const socket = io();

// Send userName to server
socket.emit('userName', username);

// Get active user list from server
socket.on('userList', (users) => {
  if(users.length === 0){
    console.log('No active users here');
  }
  else{
    outputUsers(users);
  }
});

// Get updated user list
socket.on('updatedUserList', (users) => {
  users = users.filter(user => user.id !== socket.id);
  outputUsers(users);
})

// Get welcome message from server
socket.once('welcomeMessage', message => {
  outputMessage(message);
})

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

  // Listen message from sender
  socket.on('message', text => {
    outputMessage(text);
  })

  // Add active users to DOM
  function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
      const li = document.createElement('li');
      li.classList.add('user');
      li.innerText = user.username;
      userList.appendChild(li);
      li.addEventListener('click', e => {
        e.target.style.backgroundColor = '#0e2f68';
        e.target.style.fontWeight = 'bold';
        e.target.style.borderRadius = '10px';
        socket.emit('selectedReceiver', e.target.innerText);
      })
    });
  }

  // Output message to DOM
  function outputMessage(response) {
    const p = document.createElement('p');
    p.classList.add('message');
    p.innerText = response;
    chatMessages.appendChild(p);
  }
