function ChatClient(socket) {

  var chat = this;
  this.socket = socket;
  this.num_users = 0;
  this.users = {};
  
  this.myself = {
    'uid':null, 
    'nick':null
  };
  
  this.prevSession = {};
  
  //callbacks
  this.onConnect = function() {};
  this.onNewUser = function(user) {};
  this.onSetUsers = function(users) {};
  this.onUserUpdated = function(olduser, newuser) {};
  this.onUserDisconnected = function(user) {};
  this.onMsg = function(msg) {};
  this.onMsgSent = function(success) {};
  this.onSysMsg = function (txt) {};

  //sockets
  socket.on('connect', function() { 
    chat.onConnect();
  });
  
  socket.on('disconnect', function() {
    chat.prevSession = {
      'nick':chat.myself.nick
    };
  });

  socket.on('initialize', function(mydata, ack) {
    chat.myself = mydata;
    chat.addUser(mydata);

    if( typeof(chat.prevSession.nick) !== 'undefined') {
      chat.myself.nick = chat.prevSession.nick;
      ack(chat.myself);
    } else {
      ack();
    }    
  });

  socket.on('globalData', function(data) {    
    chat.users = data;
    chat.num_users = 0;
    for(var uid in chat.users) chat.num_users++;
    chat.onSetUsers(data);
  });

  socket.on('userUpdated', function(user) {
    chat.addUser(user);  
  });

  socket.on('userDisconnected', function(uid) {
    chat.removeUser(uid);
  });

  socket.on('chatMsg', function(msg) {
    chat.onMsg(msg);
  });
  
  socket.on('sysMsg', function(msg) {
    chat.onSysMsg(msg);
  });
  

  return this;
}
  
ChatClient.prototype.addUser = function(user) {
  if(this.users[user.uid] !== undefined) {
    if(this.users[user.uid].nick != user.nick) {
      this.onUserUpdated(this.users[user.uid], user);
    }
  } else {
    this.num_users++;
    this.onNewUser(user);
  }
  
  this.users[user.uid] = user;
  return user;
}

ChatClient.prototype.removeUser = function (user) {
  var uid, exists = false;

  if(user.uid !== undefined && user.uid !== null) {
    uid = user.uid;
  } else {
    uid = user;
  }

  if(this.users[uid] !== undefined) {
    this.num_users--;
    this.onUserDisconnected(this.users[uid]);
    exists = true;
  }
  
  delete this.users[uid];
  return exists;
}

ChatClient.prototype.setNick = function(nick) {
  
  this.myself.nick = nick;
  if(this.myself.uid !== null)
    this.users[this.myself.uid].nick = nick;
  this.socket.emit('updateOwnInfo', this.myself);
}

ChatClient.prototype.sendMsg = function(msgTxt) {
  this.socket.emit('sendMsg',msgTxt); //@TO-DO
}

//Export to be used in mocha 
if (typeof module !== 'undefined' && module.exports != null) {
    exports.Chat = Chat;
}
