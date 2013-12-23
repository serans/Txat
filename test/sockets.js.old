var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://localhost:3000';

var options ={
  transports: ['websocket'],
  'force new connection': true
};

describe("Chat Server",function(){
  
  it('should send my username and uid', function() {
    var client1 = io.connect(socketURL);
    
    client1.on('ownInfoUpdated', function(data) {
      console.log(data);
    });
    
    client1.on('globalData', function(data) {
      console.log(data);
    });
    
//    client1.disconnect();
    
  });
  
});
