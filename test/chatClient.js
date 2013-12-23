var assert = require("assert")
var chatClient = require("../public/javascripts/chatClient.js");

/*
 * Sockets do not seem to work when run from mocha,
 * using a 'faux' socket instead
 */
function fauxSocket() {
  this.history = Array();
  var funcs = {};

  this.on = function (id, f) {
    funcs[id] = f;
  }
  
  this.emit = function (id, data) {
    this.history.push( {'id':id, 'data':data} );
  }
  
  this.trigger = function (id, data, fn) {
    if(typeof data === 'undefined')
      funcs[id]();
    else if(typeof fn === 'undefined')
      funcs[id](data);
    else
      funcs[id](data,fn);
  }
}


describe('ChatClient', function(){

  var socket;
  var chat;
  
  function reset() {
    socket = new fauxSocket();
    chat = new chatClient.ChatClient(socket);
  }

  function globalData() {
    return {
      3:{'uid':3, 'nick':'JohnDoe'},
      5:{'uid':5, 'nick':'Ruperta'},
      7:{'uid':7, 'nick':'Grzesak'},
    }
  }

  describe('#socket:on connect', function(){
    it('should call on Connect', function(done){
      reset();
      chat.onConnect = done;
      socket.trigger('connect');
    });
    
  });
  
  describe('#socket:on initialize', function() {
  
    it('should process the received initialization data', function(done) {
      reset();
      function init(usr) {
        assert.equal(typeof usr, 'undefined');
        assert.equal(chat.myself.uid, 3);
        assert.equal(chat.myself.nick,'guest0');
        done();
      }
      
      socket.trigger('initialize', {'uid':3, 'nick':'guest0'}, init );
    });

    it('should update its own data', function(done) {
      reset();
      function init2(usr) {
        assert.equal(chat.myself.uid, 3);
        assert.equal(chat.myself.nick,'JohnDoe');
        done();
      }
      socket.trigger('initialize', {'uid':3, 'nick':'JohnDoe'}, init2 );
    });
    
    it('should update user list with own info', function(done) {
      reset();
      function init3(usr) {
        assert.equal(chat.num_users,1);
        assert.equal(chat.users[3].nick, 'JohnDoe');        
        done();
      }

      assert.equal(chat.num_users, 0);
      assert.deepEqual(chat.users, {});
      
      socket.trigger('initialize', {'uid':3, 'nick':'JohnDoe'}, init3 );
    });
    
    it('should try to restore previous session', function(done) {
      reset();
      function init4(usr) {
        assert.equal(typeof usr, 'undefined');
      }
      
      function init5(usr) {
        assert.notEqual(typeof usr, 'undefined');
        assert.equal(usr.nick, 'JohnDoe');
        done();
      }
      
      socket.trigger('initialize', {'uid':3, 'nick':'JohnDoe'}, init4 );
      socket.trigger('disconnect');
      socket.trigger('initialize', {'uid':3, 'nick':'guest0'}, init5 );
    });
    

  });
  
  describe('#socket:on Global Data', function() {

    it('should update all users', function(done) {
      reset();
      function doneWrap(users) {
        
        //callback info
        assert.equal(users[3].nick, 'JohnDoe');
        assert.equal(users[5].nick, 'Ruperta');
        assert.equal(users[7].nick, 'Grzesak');
        
        //chat object info
        assert.equal(chat.num_users,3);
        assert.equal(chat.users[3].nick, 'JohnDoe');
        assert.equal(chat.users[5].nick, 'Ruperta');
        assert.equal(chat.users[7].nick, 'Grzesak');
        
        var count=0;
        for(var uid in chat.users) count++;
        assert.equal(count, 3);
        
        done();
      };
      
      chat.onSetUsers = doneWrap;
      socket.trigger('globalData', globalData());
    });
    
  });
  
  describe('#socket:on userUpdated', function() {

    it('should update users info', function() {
      reset();
      socket.trigger('globalData', globalData());
      socket.trigger('userUpdated', {'uid':5, 'nick':'Rupherta'});
      assert.equal(chat.num_users,3);
      assert.equal(chat.users[3].nick, 'JohnDoe');
      assert.equal(chat.users[5].nick, 'Rupherta');
      assert.equal(chat.users[7].nick, 'Grzesak');
      var count=0;
      for(var uid in chat.users) count++;
      assert.equal(count, 3);

    });
    
    it('should call onNewUser', function(done) {
      reset();
      function doneWrap(user) { 
        assert.equal(user.uid,0);
        assert.equal(user.nick,'Josephus');
        done();
      };
      
      chat.onNewUser = doneWrap;
      socket.trigger('userUpdated', {'uid':0, 'nick':'Josephus'} );
    });
    
    it('should call onUserUpdated', function(done) {
      function doneWrap(olduser, newuser) {
        assert.equal(olduser.uid,0);
        assert.equal(olduser.nick,'Josephus'); 
        assert.equal(newuser.uid,0);
        assert.equal(newuser.nick,'Pepe');
        done();
      };
      
      chat.onUserUpdated = doneWrap;
      socket.trigger('userUpdated', {'uid':0, 'nick':'Pepe'} );
    });
    
  });

  describe('#socket:on userDisconnected', function() {
    it('should delete disconnected users', function() {
      reset();
      socket.trigger('globalData', globalData());
      socket.trigger('userDisconnected', 5);
      
      assert.equal(chat.num_users,2);
      assert.equal(chat.users[3].nick, 'JohnDoe');
      assert.equal(typeof chat.users[5], 'undefined');
      assert.equal(chat.users[7].nick, 'Grzesak');

      var count=0;
      for(var uid in chat.users) count++;
      assert.equal(count, 2);
    });
    
    it('should call onUserDisconnected', function(done) {
      reset();
      
      function onUserDisconnected(user) {
        assert.equal(user.uid,3);
        assert.equal(user.nick,'JohnDoe'); 
        done();
      };
      
      chat.onUserDisconnected = onUserDisconnected;
      socket.trigger('globalData', globalData());
      socket.trigger('userDisconnected', 3 );
    });
    
    it('should be possible to remove users passing "user" object', function() {
      reset();
      socket.trigger('globalData', globalData());
      
      assert(typeof chat.users[7] !== 'undefined');
      chat.removeUser(chat.users[7]);
      assert(typeof chat.users[7] === 'undefined');
    });
    
  });
  
  describe('#socket:on chatMsg', function() {

    it('should receive chat messages', function(done) {
      function onMsg(msg) {
        assert.deepEqual(msg, {'uid':0,'msg':'Hello World'});
        done();
      }
      
      chat.onMsg = onMsg;
      socket.trigger('chatMsg', {'uid':0,'msg':'Hello World'});
    });

  });
  
  describe('#socket:on sysMsg', function() {
    
    it('should receive system messages', function(done) {
      function onSysMsg(msg) {
        assert.deepEqual(msg, 'Hello World');
        done();
      }
      
      chat.onSysMsg = onSysMsg;
      socket.trigger('sysMsg', 'Hello World');
    });
    
  });
  
  describe('#setNick', function() {
    it('should change user\'s nick', function() {
      reset();
      chat.setNick('pepe');
      assert.equal(chat.myself.nick,'pepe')
    });
    
    it('should send the new nick to the server', function() {
      reset();
      chat.setNick('pepe');
      assert.equal(socket.history[0].id,'updateOwnInfo');
      assert.deepEqual(socket.history[0].data,chat.myself);
    });
    
    it('should keep uids after changing the nick', function(done) {
      reset();
      function init(usr) {
        chat.setNick('pepe');
        assert.equal(chat.myself.uid, 3);
        assert.equal(chat.myself.nick,'pepe');
        done();
      }
      
      socket.trigger('initialize', {'uid':3, 'nick':'guest0'}, init );
    });
    
    it('should acknowledge the nick has changed', function() {
      // TO-DO
    });
  });

  describe('#sendMsg', function() {
    it('should send the message to the server', function() {
      reset();
      socket.trigger('initialize', {'uid':3, 'nick':'guest0'}, function(usr) {} );
      chat.sendMsg('hello world');
      assert.equal(socket.history[0].id,'sendMsg');
      assert.equal(socket.history[0].data,'hello world');
      
    });
    
    it('should acknowledge that the message has been sent', function() {
      // TO-DO
    });
  });
  
});
