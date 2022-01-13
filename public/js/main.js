const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
const receiverInfo = document.getElementById('receiver-info') ;
const profileName = document.getElementById('profile-name');
const notificationArea = document.getElementById('notification-area');
const notification = document.getElementById('notification');
const chatMain = document.getElementById('chat-main');

// Get username from URL
const {username} = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

let connectedSender = '';
let activeUsers = '';
let activeUser = '';
let toNotificationArea = 1;

profileName.innerText = username;
profileName.innerHTML += '<i id = "notify" class="fas fa-bell"></i>';
profileName.innerHTML += '<i class="fas fa-sign-out-alt"></i>';//fa-ellipsis-v fa-angle-down

const notificationIcon = document.getElementById('notify');

const socket = io();

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
    if(!connectedSender){
      outputNotification(text);
    } else if(connectedSender != text.userName) {
      outputNotification(text, toNotificationArea);
    } else {
      outputMessage(text);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
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
          connectedSender = user.username;
          for(let i = 0, len = chatMessages.childNodes.length; i < len; i++){
            if(chatMessages.childNodes[i].innerText.split(/\d/)[0].trim() != user.username){
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

    //

    let regexpBold = /\\B{1}(?<content>(\S+))\\B{1}/g;
    let regexpItalic = /\\i{1}(?<content>(\S+))\\i{1}/g;
    let regexpUnderline = /\\u{1}(?<content>(\S+))\\u{1}/g;
    let regexpDelete = /\\d{1}(?<content>(\S+))\\d{1}/g;
    let regexpH1 = /\\(h1){1}(?<content>(\S+))\\(h1){1}/g;
    let regexpH2 = /\\(h2){1}(?<content>(\S+))\\(h2){1}/g;
    let regexpH3 = /\\(h3){1}(?<content>(\S+))\\(h3){1}/g;
    let regexpH4 = /\\(h4){1}(?<content>(\S+))\\(h4){1}/g;
    let regexpH5 = /\\(h5){1}(?<content>(\S+))\\(h5){1}/g;
    let regexpH6 = /\\(h6){1}(?<content>(\S+))\\(h6){1}/g;
    let regexpRed = /\\(red){1}(?<content>(\S+))\\(red){1}/g;
    let regexpGreen = /\\(green){1}(?<content>(\S+))\\(green){1}/g;
    let regexpBlue = /\\(blue){1}(?<content>(\S+))\\(blue){1}/g;
    let regexpWhite = /\\(white){1}(?<content>(\S+))\\(white){1}/g;
    let regexpPink = /\\(pink){1}(?<content>(\S+))\\(pink){1}/g;
    let regexpLink = /\\a{1}(?<content>(\S+))\\a{1}/g;

    message.text = message.text.replace(regexpBold, '<b>$<content></b>');
    message.text = message.text.replace(regexpItalic, '<i>$<content></i>');
    message.text = message.text.replace(regexpUnderline, '<u>$<content></u>');
    message.text = message.text.replace(regexpDelete, '<del>$<content></del>');
    message.text = message.text.replace(regexpH1, '<h1>$<content></h1>');
    message.text = message.text.replace(regexpH2, '<h2>$<content></h2>');
    message.text = message.text.replace(regexpH3, '<h3>$<content></h3>');
    message.text = message.text.replace(regexpH4, '<h4>$<content></h4>');
    message.text = message.text.replace(regexpH5, '<h5>$<content></h5>');
    message.text = message.text.replace(regexpH6, '<h6>$<content></h6>');
    message.text = message.text.replace(regexpRed, '<span style="color: red">$<content></span>');
    message.text = message.text.replace(regexpGreen, '<span style="color: green">$<content></span>');
    message.text = message.text.replace(regexpBlue, '<span style="color: blue">$<content></span>');
    message.text = message.text.replace(regexpWhite, '<span style="color: white">$<content></span>');
    message.text = message.text.replace(regexpPink, '<span style="color: pink">$<content></span>');
    message.text = message.text.replace(regexpLink, content => {
      let ref=`'${content.slice(2,-2)} target="_blank"'`;
      return `<a href=${ref} >${content.slice(2,-2)}</a>`;
    });

    ptext.innerHTML = message.text;
    //
    // ptext.innerText = message.text;
    div.appendChild(ptext);
    if(message.userName == 'You'){
      div.style.marginLeft = 'auto';
    }
    chatMessages.appendChild(div);
  }

  function outputNotification(text, toNotificationArea = 0) {
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

    if(!toNotificationArea){
      chatMessages.appendChild(div);
      b.onclick = clickHandler;
    } else{
      p.innerText = 'Message from:';
      ptext.innerHTML = `<span> ${text.time}</span>`;
      notificationArea.appendChild(div);
      notificationIcon.innerText = notificationArea.childElementCount;
      notificationIcon.style.color = 'red';
      div.onclick = clickHandler;
    }
    function clickHandler(e) {
      if(activeUsers.length){
        for(let i = 0, len = userList.childElementCount; i < len; i++) {
          if(userList.childNodes[i].innerText === (e.target === b ? b : div.childNodes[1]).innerText.split(/\d/)[0].trim()) {
            userList.childNodes[i].click();
            outputMessage(text);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            if(toNotificationArea) {
              notificationArea.removeChild(div);
            }
            notificationIcon.innerText = notificationArea.childElementCount == 0? '': notificationArea.childElementCount;
            break;
          }
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

