/* This manages a user's socket connection while in a lobby */
/* It controls their chat and current sub-lobby */
var fs = require('fs');
var vm = require('vm');
var db = require('../database-manager/database.js');
var includeInThisContext = function(path) {
    var code = fs.readFileSync(path);
    vm.runInThisContext(code, path);
}.bind(this);

var lobbyManager = module.exports =  {
    io: {},
    lobbies: []
}

// used for sending a message to all clients in the audience lobby
lobbyManager.sendMessageToAllClients = function (messageType, messageData, audience) {
    // console.log("Send message to everyone lobby: " + audience + " : " + messageData.text);
    for(var i = 0; i < audience.length; i++) {
      audience[i].emit(messageType,messageData);
    }
}

// used for socket emitting to all users in a lobby except one
lobbyManager.sendMessageToAllExceptClient = function (messageType, messageData, audience, banID) {
    // console.log("Send message to lobby: " + audience + " : " + messageData.text);
    for(var i = 0; i < audience.length; i++) {
      if(audience[i].chatID != banID) {
        audience[i].emit(messageType,messageData);
      }
    }
}

lobbyManager.startListening = function(http) {
    this.io = require('socket.io')(http);

    //hacky fix for stuff
    var that = this;
    that.chatIDcount = 0;
    that.usersInLobby = [];
    that.numberOfClients = 0;
    //creates a listening socket io connection
    that.io.on('connection', function(socket) {
      var session = socket.handshake.session;
      socket.inChat = false;
      socket.chatNumber = -1;
      socket.hasUsername = false;
      // this is used to connect a user to a dedication chat
      // managed by the array lobbies (in each lobby is an array of the people in it)
      socket.on('connect to chat', function(chatCode) {
          if(socket.inChat) {
              //disconnect them from their past session
              if(socket.chatNumber != undefined && that.lobbies[socket.chatNumber] != undefined) {
                for(var i = socket.chatID; i < lobbies[socket.chatNumber].length; i++) {
                    that.lobbies[socket.chatNumber][i].chatID --;
                }
                that.sendMessageToAllClients('server message', {text:' -- ' + socket.name + ' has disconnected. -- ',type: 'join'}, that.lobbies[socket.chatNumber]);
              }
          }
          socket.inChat = true;

          if(that.lobbies[chatCode] == undefined) {
              // console.log("New voice lobby created");
              // create the new lobby
              that.lobbies[chatCode] = [];
              that.lobbies[chatCode].push(socket);
              socket.chatNumber = chatCode;
              //socket.chatID = 0;
          }
          else{
              // join existing lobby
              //socket.chatID = that.lobbies[chatCode].length;
              that.lobbies[chatCode].push(socket);
              socket.chatNumber = chatCode;
          }
          socket.chatID = that.chatIDcount;
          that.chatIDcount++;
      });


      socket.on('username message', function(msg){
          if(socket.chatNumber !=  -1 && that.lobbies[socket.chatNumber] != undefined) {
            if(msg == "none"){
              socket.name = "User " + socket.chatID;//that.numberOfClients;
              that.numberOfClients++;

              socket.hasUsername = false;
            }
            else{
              socket.name = msg;
              socket.hasUsername = true;
              socket.startTime = Date.now();

              // TODO:
              // socket.name is the username - update db so that they're online here
              db.update(db.userDB,{username:socket.name},{online:true,current_lobby:socket.chatNumber,last_online:Date.now()});
            }
            socket.emit('server message', {text: '  -- Hi ' + socket.name + '! Welcome to the lobby chat room! --  ' ,type: 'join'});
            that.sendMessageToAllClients('server message', {text:' -- ' + socket.name + ' has connected. -- ',type: 'disconnect'}, that.lobbies[socket.chatNumber]);
            //that.io.emit('server message', {text:' -- ' + socket.name + ' has connected. -- ',type: 'disconnect'});
            that.usersInLobby[socket.chatID]  = socket.name;
            that.sendMessageToAllClients('user join', {text:that.usersInLobby, num:that.chatIDcount}, that.lobbies[socket.chatNumber]);

          }
      });


  	  socket.on('chat message', function(msg){
  	  	console.log("Message Received, chat ID: " + socket.chatID);
  	    // socket.broadcast.emit('chat message', socket.name + ": " + msg);
        that.sendMessageToAllExceptClient('chat message', {name:socket.name, text: msg}, that.lobbies[socket.chatNumber], socket.chatID);
  	  });


      socket.on('disconnect', function () {

        // that.io.emit('server message', {text:' -- ' + socket.name + ' has disconnected. -- ',type: 'join'});
        if(socket.inChat) {
            var index = that.usersInLobby.indexOf(socket.name);
            that.usersInLobby[index] = "";
            that.numberOfClients--;
            that.sendMessageToAllClients('user join', {text:that.usersInLobby, num:that.chatIDcount}, that.lobbies[socket.chatNumber]);
            for(var i = socket.chatID; i < that.lobbies[socket.chatNumber].length; i++) {
                that.lobbies[socket.chatNumber][i].chatID --;
            }
            that.sendMessageToAllClients('server message', {text:' -- ' + socket.name + ' has disconnected. -- ',type: 'join'}, that.lobbies[socket.chatNumber]);


            if(socket.hasUsername) {

              var timeInChat = Date.now() - socket.startTime;
              // TODO:
              // socket.name is the username - update db so that they're offline here
              console.log("socket io is logging out user in database field!");
              console.log("user was logged in for " + timeInChat);
              db.search(db.userDB,{username:socket.name},function(results) {
                if( results.length ) {
                    console.log("socket io is updating user time");
                    if( results[0].time ) {
                        db.update(db.userDB,{username:socket.name},{online:false,time:(timeInChat+parseInt(results[0].time)),current_lobby:"OFFLINE",last_online:Date.now()});
                    } else {
                        db.update(db.userDB,{username:socket.name},{online:false,time:(timeInChat),current_lobby:"OFFLINE",last_online:Date.now()});
                    }
                }
              });
            }
        }
      });

    });
}
