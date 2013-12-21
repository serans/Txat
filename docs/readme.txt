== ChanChat ==

Client
  <- onOwnInfoUpdated({uid, nick}) #user data
  <- onSysMsg( rid, msg );
  
  updateOwnData(myself) ->
    <- ACK
  
  disconnect() ->

  getRoomList() ->
    <- roomList:[{ rid, name, numUsers }]
    <- onRoomUpdated( {rid, name, numUsers} )

  enterRoom( roomId ) ->
    <- ACK + usersList
    <- onUserUpdated( uid, {nick});
    <- onUserDisconnected( uid );
    <- onMsg(roomId, msg:{uid,msg});

  leaveRoom( roomId ) ->

  sendPublicMsg( roomId, msg ) ->
    <- ACK
  
  sendPrivateMsg( uid, msg ) ->
    <- ACK


