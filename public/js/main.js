const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
const receiverInfo = document.getElementById('receiver-info') ;

// Get username from URL
const {username} = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Send userName to server
socket.emit('userName', username);

// Get active user list from server
socket.on('userList', (users) => {
  if(users.length > 0){
    outputUsers(users);
  }
});

// Get updated user list
socket.on('updatedUserList', (users, user) => {
  users = users.filter(user => user.id !== socket.id);
  outputUsers(users);
  if(user === receiverInfo.innerText) {
    chatMessages.innerHTML = '';
    receiverInfo.innerText = 'InstantChat Server';
    outputMessage({userName: 'Server', text: `${user} has left.`, time: moment().format('h:mm a')});
  }
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

    if(receiverInfo.innerText != 'InstantChat Server') {
      outputMessage({userName: 'You', text, time: moment().format('h:mm a')});
    }
  
    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
  });

  // Listen message from server
  socket.on('staticMessageFromServer', response => {
    chatMessages.innerHTML = '';
    receiverInfo.innerText = 'InstantChat Server';
    outputMessage(response);
  });

  // Listen message from sender
  socket.on('message', text => {
    outputMessage(text);
  });

  //Deselect receiver
  socket.on('deselectReceiver', receiver => {
    for(let i = 0, len = userList.children.length; i < len; i++){
      if(userList.children[i].innerText === receiver){
        userList.children[i].style.backgroundColor = '';
        userList.children[i].style.fontWeight = '';
        userList.children[i].style.borderRadius = '';
        break;
      }
    }
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
        if(receiverInfo.innerText != user.username) {
          receiverInfo.innerText = user.username;
          for(let i = 0, len = chatMessages.childNodes.length; i < len; i++){
            if(chatMessages.childNodes[i].innerText.split(' ')[0] != user.username){
              chatMessages.removeChild(chatMessages.childNodes[i]);
              len--;
              i--;
            }
          }
        }
        e.target.style.backgroundColor = '#0e2f68';
        e.target.style.fontWeight = 'bold';
        e.target.style.borderRadius = '10px';
        socket.emit('selectedReceiver', e.target.innerText);
      })
    });
  }

  // Output message to DOM
  function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.userName;
    p.innerHTML += `<span> ${message.time}</span>`;
    div.appendChild(p);
    const ptext = document.createElement('p');
    ptext.classList.add('text');
    ptext.innerText = message.text;
    div.appendChild(ptext);
    if(message.userName == 'You'){
      div.style.marginLeft = 'auto';
    }
    chatMessages.appendChild(div);
  }
