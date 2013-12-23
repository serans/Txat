/*
 * @requires: chat.js, jQuery
 */

var socket = io.connect();
var chat = new ChatClient(socket);
var chatUI = new ChatUI(chat);

$( function() {

  chatUI.screen.out.chat = $('#chat-main');
  chatUI.screen.out.users = $('#chat-users-list');
  chatUI.screen.out.myself = $('#myself');
  
  chatUI.screen.tab.setup = $('#setup');
  chatUI.screen.tab.chat = $('#chat');
  
  chatUI.screen.form.nick = $('#nickname-form');
  chatUI.screen.form.chat = $('#chat-form');
  
  chatUI.initialize();

});
