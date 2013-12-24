/**
 * Module dependencies.
 */
var http = require('http');
var express = require('express');
var iomodule = require('socket.io');
var less = require('less-middleware');
var chatUsers = require('./chatUsers');

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('env','development');
app.use(less({ src: __dirname + "/public", compress: true }));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(__dirname + '/public'));

// development only
if ('development' == app.get('env')) {
  console.warn("WARNING: Development Mode Activated!");
  app.use(express.errorHandler());
}

app.get('/', function(req, res) {
   res.render('index');
});

var httpserver = http.createServer(app);
httpserver.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = iomodule.listen(httpserver, {log:false});

var users = Object();

io.sockets.on('connection', function(socket) {
  
  var user = chatUsers.newUser();
  socket.set('uid', user.uid);

  socket.emit('initialize', user, function(data) {
    if(typeof(data) !== 'undefined' && typeof(data) !== 'null') {
      socket.get('uid', function(err, uid) {
        if(!chatUsers.updateUser(uid, data)) {
          socket.emit('sysMsg', 'could not restore previous session');
        }
      });
    }
    socket.broadcast.emit('userUpdated', user);
    socket.emit('globalData', chatUsers.list)
  });
  
  socket.on('updateOwnInfo', function(userInfo) {
    socket.get('uid', function(error, uid) {
      if(error) {
        console.log("error updating own info");
        return;
      }
      if(uid===null) return;

      if(chatUsers.updateUser(uid,userInfo)) {
        socket.broadcast.emit('userUpdated', chatUsers.list[uid]);
      }
      
    });
  });
  
  socket.on('disconnect', function() {
    console.log('DISCONNECT '+socket.id);
    socket.get('uid', function(error, uid) {
      if(chatUsers.removeUser(uid)) {
        socket.broadcast.emit('userDisconnected',uid);
      }
    });
  });
  
  socket.on('sendMsg', function(msg) {
    socket.get('uid', function(error, uid) {
      console.log('sendMsg');
      if(uid !== null)
        socket.broadcast.emit('chatMsg',{'uid':uid,'msg':msg});
    });
  });

});
/*
process.on('uncaughtException', function (exception) {
  // handle or ignore error
  console.log('EXCEPTION: '+exception);
});*/
