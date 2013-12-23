var assert = require("assert")
var chatUsers = require("../chatUsers.js");

describe('ChatUsers', function(){

  describe('create users', function(){
    it('should create a new user, with unique uid and non-empty name', function(){
      var user0 = chatUsers.newUser();
      var user1 = chatUsers.newUser();
      
      assert.notEqual(user0.uid, user1.uid);
      
      assert.notEqual(user0.nick, '');
      assert.notEqual(user0.nick, null);
      assert.notEqual(user0.nick, user1.nick);
    });
    
  });
  
  describe('update users',function() {
    var user2 = chatUsers.newUser();
    var uid = user2.uid;

    it('should update nick', function() {
      
      chatUsers.updateUser(uid, {'nick':'jon'});
      assert.equal(user2.nick,'jon');
      
    });
    
    it('should not update uid', function () {
      chatUsers.updateUser(uid, {uid:uid+1});
      assert.equal(user2.uid, uid);
    });
    
  });
  
  describe('removeUser', function() {
    var user3 = chatUsers.newUser();
    it('should remove a user from the list of users', function() {
      assert.notEqual(chatUsers.list[user3.uid],undefined);
      chatUsers.removeUser(user3.uid);
      assert.equal(chatUsers.list[user3.uid],undefined);
    });
  });

});
