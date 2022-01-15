import { formatMessage } from "./utils/formats.js";

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
const receiverInfo = document.getElementById('receiver-info') ;
// const profileDiv = document.getElementById('profile-name');
const profileName = document.getElementById('profile-name-span');
const notificationArea = document.getElementById('notification-area');
const notification = document.getElementById('notification');
const chatMain = document.getElementById('chat-main');
const notificationIcon = document.getElementById('notify');
const logoutIcon = document.getElementById('logout');


// Get username from URL
const {username} = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

let connectedSender = '';
let activeUsers = '';
let activeUser = '';
let toNotificationArea = 1;

profileName.innerText = username;

const socket = io();

let selectedReceiver = {name: '', id: ''};

// Logout button
logoutIcon.addEventListener('click', e => {
  socket.disconnect();
  location.replace("index.html");
})

// Send userName to server
socket.emit('userName', username);

// Get active user list from server
socket.on('userList', (users) => {
  if(users.length > 0){
    activeUsers = [...users];
    outputUsers(users);
  }
});

// Get updated user list
socket.on('updatedUserList', (users, user) => {
  users = users.filter(user => user.id !== socket.id);
  activeUsers = [...users];
  outputUsers(users);
  if(user === receiverInfo.innerText) {
    chatMessages.innerHTML = '';
    receiverInfo.innerText = 'InstantChat Server';
    outputMessage({userName: 'Server', text: `\\B\\blue${user}\\blue\\B has left.`, time: moment().format('h:mm a')});
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
      chatMessages.scrollTop = chatMessages.scrollHeight;
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
    if(!selectedReceiver.name){ //
      outputNotification(text);
    } else if(selectedReceiver.id != text.id) { //
      outputNotification(text, toNotificationArea);
    } else {
      outputMessage(text);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });

  //Deselect receiver
  socket.on('receiverDeselection', (user) => {
    for(let i = 0, len = userList.children.length; i < len; i++){
      if(userList.children[i].innerText === user.name && userList.children[i].id ===user.id){
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
      li.id = `${user.id}`;
      li.innerText = user.username;
      userList.appendChild(li);
      li.addEventListener('click', e => {
        if(selectedReceiver.id !== user.id) {
          receiverInfo.innerText = user.username;
          selectedReceiver.name = user.username;
          selectedReceiver.id = user.id;
          e.target.style.backgroundColor = '#0e2f68';
          e.target.style.fontWeight = 'bold';
          e.target.style.borderRadius = '10px';
          socket.emit('receiverSelection', {name: user.username, id: user.id});
          for(let i = 0, len = chatMessages.childNodes.length; i < len; i++){
            if(chatMessages.childNodes[i].innerText.split(/\d/)[0].trim() != user.username){
              chatMessages.removeChild(chatMessages.childNodes[i]);
              len--;
              i--;
            }
          }
        }
      });
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

    ptext.innerHTML = formatMessage(message.text);
    //
    // ptext.innerText = message.text;
    div.appendChild(ptext);
    if(message.userName == 'You'){
      div.style.marginLeft = 'auto';
    }
    chatMessages.appendChild(div);
  }

  function outputNotification(text, toNotificationArea1 = 0) {
    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = 'Server';
    p.innerHTML += `<span> ${text.time}</span>`;
    div.appendChild(p);
    const b = document.createElement('b'), ptext = document.createElement('p');
    b.classList.add('sender');
    b.appendChild(document.createTextNode(`${text.userName} `));
    div.appendChild(b);
    ptext.innerText = 'has sent you a message.';
    div.appendChild(ptext);
    ptext.style.display = 'inline-block';

    if(!toNotificationArea1){
      chatMessages.appendChild(div);
      b.id = `${text.id}`;
      b.onclick = clickHandler;
    } else{
      p.innerText = 'Message from:';
      ptext.innerHTML = `<span> ${text.time}</span>`;
      notificationArea.appendChild(div);
      notificationIcon.innerText = notificationArea.childElementCount;
      notificationIcon.style.color = 'red';
      div.id = `${text.id}`;
      div.onclick = clickHandler;
    }
    function clickHandler(e) {
      let toNotificationArea2 = toNotificationArea1;
      if(activeUsers.length){
        for(let i = 0, len = userList.childElementCount; i < len; i++) {
          if(/*userList.childNodes[i].innerText === (e.target === b ? b : div.childNodes[1]).innerText.split(/\d/)[0].trim() && */ e.target.id === userList.childNodes[i].id) {
            userList.childNodes[i].click();
            outputMessage(text);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            if(toNotificationArea2) {
              notificationArea.removeChild(div);
              notificationIcon.innerText = notificationArea.childElementCount == 0? '': notificationArea.childElementCount;
              toNotificationArea2 = 0;
            }
            break;
          }
        }
        if(toNotificationArea2) {
          notificationArea.removeChild(div);
          notificationIcon.innerText = notificationArea.childElementCount == 0? '': notificationArea.childElementCount;
          chatMessages.innerHTML = '';
          receiverInfo.innerText = 'InstantChat Server';
        } else{
          chatMessages.innerHTML = '';
        }
        outputMessage(text);
        if(receiverInfo.innerText !== text.userName){
          outputMessage({userName: 'Server', text: `\\B\\blue${text.userName}\\blue\\B has left.`, time: moment().format('h:mm a')});
        }
      } else {
        console.log('No active user.');
      }
    }
  }

  // Add/Remove notification panel
  notification.style.display = 'none';
  notificationIcon.addEventListener('click', e => {
    notificationIcon.style.color = '';
    if(notification.style.display == 'none'){
      notification.style.display = 'block';
      chatMain.style.gridTemplateColumns = '1fr 3fr 1fr';
    } else{
      chatMain.style.gridTemplateColumns = '1fr 4fr';
      notification.style.display = 'none';
    }
  });

  // Add emoji panel
  const picker = new EmojiButton({
    autoHide: false,
    emojiSize: '20px',
    emojisPerRow: 14,
    rows: 4,
    showSearch: false,
    showPreview: false,
    position: 'top-start'
  });
  const emojiTrigger = document.getElementById('emoji-btn');
  
  picker.on('emoji', selection => {
    chatForm.elements.msg.value += `${selection}`;
  });
  
  emojiTrigger.addEventListener('click', () => picker.togglePicker(emojiTrigger));

