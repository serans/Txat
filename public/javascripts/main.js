/*
 * @requires: chat.js, jQuery
 */

var socket = io.connect();
var chat = new ChatClient(socket);
var initDate = new Date();

var screen = {
  'chat':null,
  'users':null,
}

chat.onMsg = addMsg;
chat.onSysMsg = addSysMsg;
chat.onNewUser = function(user) { 
  addSysMsg(user.nick+' has joined');
  updateUser(user);
}
chat.onUserUpdated = function(olduser,newuser) { 
  addSysMsg(olduser.nick+' is now known as '+newuser.nick); 
  updateUser(newuser);
}

chat.onUserDisconnected = function(user) {
  addSysMsg(user.nick+' has left');
  removeUser(user);
}

chat.onSetUsers = function (users){
  for(var uid in users) {
    updateUser(users[uid]);
  }
}

function removeUser(user) {
  var uid_divs = screen.users.find('.uid');

  for(var i=0; i<uid_divs.length; i++) {
    var uid = $(uid_divs[i]).text();
    if(uid == user.uid) {
      $(uid_divs[i]).parent().remove();
      return;
    }
  }

}

function updateUser(user) {

  if(user.uid == chat.myself.uid) {
    $('#myself').find('.name').text(user.nick);
    return;
  }

  var uid_divs = screen.users.find('.uid');

  for(var i=0; i<uid_divs.length; i++) {
    var uid = $(uid_divs[i]).text();
    if(uid == user.uid) {
      $(uid_divs[i]).parent().find('p').text(user.nick);
      return;
    }
  }

  var html = '';
  html += "<div class='list-group-item'>";
  html += "<div class='uid hidden' >";
  html += user.uid;
  html += "</div>";
  html += "<p>"+user.nick+"</p>";
  html += "</div>";
  
  screen.users.append(html);
}

function htmlEncode(txt) {
  return $('<div />').text(txt).html()
}

function scrollWindow () {
  screen.chat[0].scrollTop = screen.chat[0].scrollHeight;
  window.scrollTo(0,document.body.scrollHeight);
}

function addOwnMsg(msg) {
  var lastMsg = screen.chat.find('.msg:last');
  
  if(lastMsg.hasClass('me')) {
    lastMsg.append('<hr/>'+htmlEncode(msg))
  } else {
    screen.chat.append(
      '<div class="msg bubble me">'+
        htmlEncode(msg)+
      '</div>');
  }
  
  scrollWindow();
}

function addMsg(msg) {
  var date = new Date();
  var uid = msg.uid;
  var nick = chat.users[uid].nick;
  var msgTxt = msg.msg;
  var append = {
    'date': true,
    'nick': true,
    'newBubble':true
  }
  
  var lastMsg = screen.chat.find('.msg:last');
  
  if ( lastMsg.find('.uid').text() == uid ) {
    append.newBubble = false;
    append.nick = false;
    
    //show date if old message older than one minute
    var prevDate = Number(lastMsg.find('.timestamp').text());
    if(date.getTime()-prevDate < (60 * 1000) )
      append.date = false;
    console.log(prevDate);    
  }
  
  var html = '';
  
  if(append.newBubble) {
    html += '<div class="msg bubble others">';
    html += '<div class="hidden uid">';
    html += uid;
    html += '</div>';
  }
  
  if(append.nick || append.date) {
    html += '<div class="bubbleInfo">';
  }
    
  if(append.date) {
    html += '<div class="date">';
    html += '<div class="hidden timestamp">';
    html += date.getTime();
    html += '</div>';
    html += date.getHours()+':'
    html += (date.getMinutes()<10)? '0'+date.getMinutes(): date.getMinutes();
    html += '</div>';
  }
  
  if(append.nick) {
    html += '<div class="nick">';
    html += nick;
    html += '</div>';
  }
  
  if(append.nick || append.date) {
    html += '</div>';
  }
  
  html += '<p>'+htmlEncode(msgTxt)+'</p>';
  
  if(append.newBubble) {
    html += '</div>';
  }
  
  if(append.newBubble) screen.chat.append(html);
  else lastMsg.append(html);
  
  scrollWindow();
}

function addSysMsg (text) {
    screen.chat.append(
      '<div class="msg system">'+
        htmlEncode(text)+
      '</div>');
    scrollWindow();
}

$( function() {

  screen.chat = $('#chat-main');
  screen.users = $('#chat-users-list');
    
  $('.btn-back').click( function() {
    $('#setup').slideDown();
    $('#chat').slideUp();
  });
  
  $('#nickname-form').submit( function(event) { 
    event.preventDefault(); 
    var nick = $('#nickname-input').val();

    if(nick != chat.myself.nick) {
      addSysMsg('you are now known as '+nick);
      chat.setNick(nick);
      updateUser(chat.myself);
    }
    $('#setup').slideUp();
    $('#chat').slideDown();
    $('#chat-input').focus();
  });
  
  $('#chat-form').submit( function(event) {
    var msg = $('#chat-input').val();
    chat.sendMsg(msg);
    $('#chat-input').val('').focus();
    addOwnMsg(msg);
    event.preventDefault();
  });
  
  $('#chat').hide();
});
