/*
 * @requires: chat.js, jQuery
 */

var socket = io.connect();

var chat;

var myUser = {
  'uid':null, 
  'aid':null, 
  'nick':null
};

var chatUsers = Object();

socket.on('ownInfoUpdated', function(userInfo) {
  myUser = userInfo;
});

socket.on('globalData', function(data) {
  chatUsers = data;
  updateAvatarCount(chatUsers);
  updateChatList(chatUsers);
});

socket.on('userUpdated', function(user) {
  chatUsers[user.uid] = user;  
  updateAvatarCount(chatUsers);
  updateChatList(chatUsers);
});

socket.on('userDisconnected', function(uid) {
  delete chatUsers[uid];
  updateAvatarCount(chatUsers);
  updateChatList(chatUsers);
});

socket.on('chatMsg', function(msg) {
  $('#chat-main').append('<div class="bubble others">'+
                            '<div class="bubbleInfo">'+
                            
                              '<div class="date">'+
                                '1 minute ago'+
                              '</div>'+
                              
                              '<div class="nick">'+
                                $('<div />').text(chatUsers[msg.uid].nick).html()+
                              '</div>'+
                              
                            '</div>'+
                            $('<div/>').text(msg.msg).html()
                        +'</div>');
  
  $('#chat-main')[0].scrollTop = $('#chat-main')[0].scrollHeight;
  window.scrollTo(0,document.body.scrollHeight);
});

function updateAvatarCount(users) {

  var aids = Array();
  for(var i=0; i<avatar_images.length; i++) aids[i]=0;
  
  for(var uid in users) 
    if(users[uid].aid!==null && uid!=myUser.uid) 
      aids[users[uid].aid]++;

  for(var i=0; i<aids.length; i++) {
    var avatar = $('#avatar-'+i);
    $(avatar).find('.signal').remove();
    if(aids[i]>0) {
      $(avatar).append('<div class="signal">x'+aids[i]+'</div>');
    }
  }
}

function updateChatList(users) {
  
  function addRow(uid, cssClass) {
    var name = $('<div/>').text(users[uid].nick).html(); //escapes HTML
    var image = avatar_images[users[uid].aid];
    if(image===undefined) image='../undefined.png';
    
    var htmlRow = '<div id="chat-list-item-'+uid+'" class="list-group-item ';
    if(cssClass!==undefined) htmlRow+=cssClass;
    htmlRow+='"><img src="/images/avatars/default/'+image+'"> ';
    htmlRow+=name+'</div>'
    
    $('#chat-list').append(htmlRow);
  }
  
  $('#chat-list').find('.list-group-item').remove();
  
  for(var uid in users) {
    if(uid != myUser.uid) {
      addRow(uid);
    }
  }
  
  addRow(myUser.uid,'myUserRow');
}

function sendChatMessage(msg) {
  socket.emit('sendMsg', msg);
  $('#chat-input').val('');
  $('#chat-main').append('<div class="bubble me">'+$('<div/>').text(msg).html()+'</div>');

  $('#chat-main')[0].scrollTop = $('#chat-main')[0].scrollHeight;
  window.scrollTo(0,document.body.scrollHeight);
}

function selectAvatar(avatar) {
  aid = $(avatar).find('.avatar-wrapper').attr('id').match(/[0-9]+$/)[0];
  myUser.aid = aid;
  chatUsers[myUser.uid] = myUser;
  updateChatList(chatUsers)
  socket.emit('updateOwnInfo', {'aid':aid}); /*, function (response) {
    console.log('response received '+response);
  });*/
}

function setNick(nick) {
  myUser.nick = nick;
  chatUsers[myUser.uid] = myUser;
  updateChatList(chatUsers)
  socket.emit('updateOwnInfo',{'nick':nick}); /*, function (response) {
    console.log('NICK set '+response);
  });*/
}

$( function() {

  $('#chat').hide();
  
  $('.avatar-select').click( function() {
    $('.avatar-selected').removeClass('avatar-selected')
    $(this).addClass('avatar-selected');
    selectAvatar(this);
    $('#nickname-input').focus();
  });
  
  $('.btn-back').click( function() {
    $('#setup').slideDown();
    $('#chat').slideUp();
  });
  
  
  
  $('#nickname-form').submit( function(event) { 
    event.preventDefault(); 
    setNick($('#nickname-input').val());
    $('#setup').slideUp();
    $('#chat').slideDown();
    $('#chat-input').focus();
  });
  
  $('#chat-form').submit( function(event) {
    sendChatMessage($('#chat-input').val());
    event.preventDefault();
  });
  
  chat = new Chat({
    'chatWindow':'#chat-main', 
    'userList':'#chat-list'
  });
  
});
