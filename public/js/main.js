const chatForm = document.getElementById('chat-form');

const socket = io();

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