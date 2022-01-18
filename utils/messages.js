const moment = require('moment');

function formatMessage(userName, text, id = '') {
  return {
    id,
    userName,
    text,
    time: moment().format('h:mm a')
  };
}

module.exports = formatMessage;