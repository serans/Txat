function User(uid) {
  this.uid = uid;
  this.nick = null;
  
  return this; 
}

User.prototype.setNick = function (nick) { 
  if(nick!==null && typeof(nick)==='string' && nick!='') {
    this.nick = nick.substring(0,100);
  }
  return this; 
}

exports.list = Object();
exports.total = 0;
exports.current = 0;

exports.newUser = function() {
  var uid = this.total;
  var user = new User(uid);
  user.setNick(getUniqueNick());
  this.list[uid] = user;
  this.total++;
  this.current++;
  return user;
}

exports.updateUser = function(uid, user) {
  if(this.list[uid] === undefined) 
    return false;
  
  this.list[uid].setNick(user.nick);
  return true;
}

exports.removeUser = function(uid) {
  if(this.list[uid]===undefined) return false;

  delete this.list[uid];
  this.current--;
  return true;
}

function getUniqueNick() {
  var base='guest';
  for(var i=0; i<1000; i++) {
    var match = false;
    
    for(uid in exports.list) {
      if(exports.list[uid].nick == base+i ) {
        match=true;break;
      }
    }
    
    if(!match) {
      return base+i;
    }
    
  }
  return null;
}
