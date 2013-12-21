var assert = require("assert")
var chatUsers = require("../chatUsers.js");

describe('chatUsers', function(){

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

    it('should update both nick and aid', function() {
      
      chatUsers.updateUser(uid, {'nick':'jon', 'aid':1});
      assert.equal(user2.nick,'jon');
      assert.equal(user2.aid,1);
      
      chatUsers.updateUser(uid, {'aid':2});
      assert.equal(user2.nick,'jon');
      assert.equal(user2.aid,2);
      
      chatUsers.updateUser(uid, {'nick':'John'});
      assert.equal(user2.nick,'John');
      assert.equal(user2.aid,2);
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
