function ChatUI(chat) {
  var chatUI = this;
  this.chat = chat;
  
  this.screen = {
    'form': {
      'nick': null,
      'chat': null
    },
    'tab': {
      'setup':null,
      'chat':null,
      'emoji':null
    },
    'out': {
      'chat':null,
      'users':null,
      'myself':null
    }
  }
  
  chat.onMsg = function(msg) {
    chatUI.addMsg(msg);
  }
  
  chat.onSysMsg = function(msg) {
    chatUI.addSysMsg(msg);
  }
  
  chat.onNewUser = function(user) { 
    chatUI.addSysMsg(user.nick+' has joined');
    chatUI.updateUser(user);
    chatUI.checkUserListIsEmpty();
  }
  
  chat.onUserUpdated = function(olduser,newuser) { 
    chatUI.addSysMsg(olduser.nick+' is now known as '+newuser.nick); 
    chatUI.updateUser(newuser);
  }

  chat.onUserDisconnected = function(user) {
    chatUI.addSysMsg(user.nick+' has left');
    chatUI.removeUser(user);
    chatUI.checkUserListIsEmpty();
  }

  chat.onSetUsers = function (users){
    chatUI.screen.out.users.find('.list-group-item').remove();
    for(var uid in users) {
      chatUI.updateUser(users[uid]);
    }
    chatUI.checkUserListIsEmpty();
  } 
}

ChatUI.prototype.checkUserListIsEmpty = function() {
  this.screen.out.users.find('.nousers').remove();
  if(this.chat.num_users < 2 ) {
    this.screen.out.users.append('<div class="list-group-item nousers">no online users</div>');
  }
}

ChatUI.prototype.removeUser = function (user) {

  var uid_divs = this.screen.out.users.find('.uid');

  for(var i=0; i<uid_divs.length; i++) {
    var uid = $(uid_divs[i]).text();
    if(uid == user.uid) {
      $(uid_divs[i]).parent().remove();
      return;
    }
  }
  
}


ChatUI.prototype.updateUser = function (user) {

  if(user.uid == chat.myself.uid) {
    this.screen.out.myself.find('.name').text(user.nick);
    return;
  }

  var uid_divs = this.screen.out.users.find('.uid');
  
  if(uid_divs.length == 0) {
    this.screen.out.users.find('list-group-item').remove();
  }

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
  
  this.screen.out.users.append(html);
}

ChatUI.prototype.htmlEncode = function(txt) {
  return $('<div />').text(txt).html()
}

ChatUI.prototype.scrollWindow = function() {
  this.screen.out.chat[0].scrollTop = this.screen.out.chat[0].scrollHeight;
  window.scrollTo(0,document.body.scrollHeight);
}

ChatUI.prototype.addOwnMsg = function(msg) {
  var lastMsg = this.screen.out.chat.find('.msg:last');
  
  if(lastMsg.hasClass('me')) {
    lastMsg.append('<hr/>'+this.htmlEncode(msg))
  } else {
    this.screen.out.chat.append(
      '<div class="msg bubble me">'+
        this.htmlEncode(msg)+
      '</div>');
  }
  
  this.scrollWindow();
}

ChatUI.prototype.addMsg = function(msg) {
  var date = new Date();
  var uid = msg.uid;
  var nick = chat.users[uid].nick;
  var msgTxt = msg.msg;
  var append = {
    'date': true,
    'nick': true,
    'newBubble':true
  }

  var lastMsg = this.screen.out.chat.find('.msg:last');
  
  if ( lastMsg.find('.uid').text() == uid ) {
    append.newBubble = false;
    append.nick = false;
    
    //show date if old message older than one minute
    var prevDate = Number(lastMsg.find('.timestamp').text());
    if(date.getTime()-prevDate < (60 * 1000) )
      append.date = false;
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
  
  html += '<p>'+this.htmlEncode(msgTxt)+'</p>';
  
  if(append.newBubble) {
    html += '</div>';
  }
  
  if(append.newBubble) this.screen.out.chat.append(html);
  else lastMsg.append(html);
  
  this.scrollWindow();
}

ChatUI.prototype.addSysMsg = function (text) {
    this.screen.out.chat.append(
      '<div class="msg system">'+
        this.htmlEncode(text)+
      '</div>');
    this.scrollWindow();
}

ChatUI.prototype.showTab = function(tab) {
  if(tab == 'setup' ){
    $('#header').hide();
    this.screen.tab.setup.slideDown();
    this.screen.tab.chat.slideUp();
  } else if(tab == 'chat') {
    $('#header').show();
    this.screen.tab.setup.slideUp();
    this.screen.tab.chat.slideDown();
    this.screen.form.nick.find('input[name="nickname"]').focus();
  } else if(tab == 'emoji') {
    //TO-DO
  }
}

ChatUI.prototype.initialize = function() {
  var chatUI = this;

  $('.btn-setup').click( function() {
    chatUI.showTab('setup');
  });
  
  this.screen.form.nick.submit( function(event) { 
    event.preventDefault(); 
    var nick = chatUI.screen.form.nick.find('input[name="nickname"]').val();

    if(nick != chat.myself.nick) {
      chatUI.addSysMsg('you are now known as '+nick);
      chatUI.chat.setNick(nick);
      chatUI.updateUser(chatUI.chat.myself);
    }
    
    chatUI.showTab('chat');
  });
  
  this.screen.form.chat.submit( function(event) {
    event.preventDefault();

    var input = chatUI.screen.form.chat.find('input[name="chat"]');
    chatUI.chat.sendMsg( input.val() );
    chatUI.addOwnMsg( input.val() );
    input.val('').focus();
  });
  
}
