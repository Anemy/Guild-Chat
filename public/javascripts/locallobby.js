/*this script will handle lobby creation and management*/
//makes local client connection
var socket = io();
// logged in is a varaible in login.js
var intialName = loggedIn;
var owner;


if(window.location.pathname == "/lobby/" || window.location.pathname == "/lobby"){
  console.log("adding the current lobbies to the main page");
  $('#LList').empty();
  if(lobbies != null){
    for(var i = 0; i < lobbies.length;i++){
        $('#LList').append('<a href ="/lobby/'+lobbies[i]+'"><li class="lobbyName" id="lobby['+i+']">'+lobbies[i]+'</li></a>');
        console.log(lobbies[i]);
    }
  }
}

//keep it hidden at the beginning
$('.deleteButton').hide();
/*$.ajax({
  url: "/lobbyLogin",
  type: "POST",
  data: {
      lobby_title : //stuff,
      password : //morestuff,
  },
  success: function(data){
    data = JSON.parse(data);

    if(data.value == "Success") {
      // user made it into lobby
      // go to the rest of page
    }
    else {
      swal("Oops...", "Password is incorrect.", "error");
    }
  }, 
  error: function(data){
      swal("Oops...", "Password is incorrect.", "error");*/
    var url = window.location.pathname;
    var to = url.lastIndexOf('/') + 1;
    var chatToConnect =  url.substring(to,url.length);

    $.ajax({
        url: "/lobby/getInfo",
        type: "POST",
        data: {
            lobbyName: chatToConnect
        },
        success: function(data){
            data = JSON.parse(data);
            // console.log("OWNER is: " + data.value);
            owner = data.value;
            if(owner != "None"){
              $('.lobbyOwner').html("Lobby Owner:" + '<br>' + '<a text-decoration= underline; href="/users/'+owner+'">' + owner + "</a>");
            }
            //Pascal 04/22/15 if user is not owner of lobby, hide delete button
            if (owner != loginData || url == "/lobby") {
              // console.log("testing!!!");
              $('.deleteButton').hide();
            } else {
              $('.deleteButton').show();
            }

        },
        error: function(data){
            // sweetAlert("Oops...", "Can't get name", "error");
            console.log("Failure from server: " + data);
            $('.lobbyOwner').html("Lobby Owner: None");
            owner = "None";
        }
    });

//event handler for delete lobby button
var redirectToDeleteClicked = function() {
  $.ajax({
        url: "/deleteLobby",
        type: "POST",
        data: {
            lobbyName: chatToConnect
        },
        success: function(data){
            $("body").fadeOut(1000,function(){
              window.location.href = "/";
            })

        },
        error: function(data){
            $("body").fadeOut(1000,function(){
              window.location.href = "/";
            })
        }
    });
}

if (lobbyPassword != ".") {
  var passwd = ".";
  while(passwd != lobbyPassword) {
    passwd = prompt("Please enter the lobby password: ");
 }
}


  socket.on('chat message', function(msg) {
    //$('#messages').append($('<div class="messageSpacer"/>'));
    var html = '';
    html += '<div class="messageSpacer">';
    if(msg.name == loginData ){
        // html +=   '<li class="selfMessage">' + msg.text + '</li>';
    }
    else {
        html +=   '<li class="playerMessage">' + msg.name + ": " + msg.text + '</li>';
    }
    html += '</div>';
    $('#messages').append( html ); // $('<div class="messageSpacer"><li class="playerMessage"></div>').text(msg));
    document.getElementById("msgBox").scrollTop = document.getElementById("msgBox").scrollHeight;
  });

  socket.on('user join', function(msg){
    $('#userList').empty();
    var nameList = [];

    // add the lobby owner
    // console.log("The lobby owner is: " + owner);
    // $('.pageThings').append($('<li class="lobbyOwner"><a href ="/users/'+owner+'">'+"Owner: " + owner+'</a></li>'));

    if(owner != "None"){
      $('.lobbyOwner').html("Lobby Owner:" + '<br>' +'<a text-decoration= underline; href="/users/'+owner+'">' + owner + "</a>");
    }
    for(var i = 0; i < msg.num; i++){
      // console.log("User " + msg.text[i] + " added");
      if(msg.text[i] != "" && msg.text[i] != undefined && nameList.indexOf(msg.text[i]) == -1){
          nameList[i] = msg.text[i];
          if(msg.text[i].indexOf("User") == 0) {
            $('#userList').append($('<li class="userName">'+"- " + msg.text[i]+'</li>'));
          }//if we wanted to add color style="background-color:blue;"
          else {
            // console.log("loginDAta:" +msg.text[i]);
            // console.log("owner:" +owner);
            // if(owner == msg.text[i]){
            //   $('#userList').append($('<a href ="/users/'+msg.text[i]+'"><li  class="userName">'+"- "+'<img class="bannerIMG" id="bannerIMG" src="/images/profile/rank1.png" style="width:1em;height:1em">' + msg.text[i]+'</li></a>'));
            // }
            // else{
            //   $('#userList').append($('<a href ="/users/'+msg.text[i]+'"><li  class="userName">'+"- " + msg.text[i]+'</li></a>'));
            // }
            // console.log("Msg text i: " + msg.text[i] + " loggedin: "+loginData);
            if(msg.text[i] != 'me' && msg.text[i] != 'vv'){
              $('#userList').append($('<a href ="/users/'+msg.text[i]+'"><li  class="userName">'+"- "+'<img class="bannerIMG" id="bannerIMG" src="/images/profile/rank3.png" style="width:1em;height:1em">' + msg.text[i]+'</li></a>'));
            }
            else {
              $('#userList').append($('<a href ="/users/'+msg.text[i]+'"><li  class="userName">'+"- "+'<img class="bannerIMG" id="bannerIMG" src="/images/profile/rank2.png" style="width:1em;height:1em">' + msg.text[i]+'</li></a>'));
            }


            if(loggedIn && msg.text[i] != loginData) {
              $('#userList').append($('<div id="' + msg.text[i]+'" class="friendButton addButton"></div>'));
            }
          }
          $('#userList').append($('<div class="lineSpacer"/>'));
      }
    }

    $('.friendButton').click(function(event) {
      var userToAddToFriends = $(this).attr('id');
      if($(this).hasClass('addButton')) {
        $(this).removeClass('addButton');
        $(this).addClass('removeButton');

        // make the request
        $.ajax({
            url:"/users/addFriend",
            type: "POST",
            data: {
                addFriend : $(this).attr('id')
            },
            success: function(data){ 
                // console.log("Successfully added friend");
                var alertTitle = "Added ";
                alertTitle = alertTitle.concat(userToAddToFriends);
                alertTitle = alertTitle.concat(" to your Friends List");
                swal({title:"Success!", text: alertTitle, type:"success"});
            },
            error: function(data){
                // console.log(data.responseText);
                swal({title: "Error",text: data.responseText , type:"error"});
            }
        });
      }
      else {
        $(this).removeClass('removeButton');
        $(this).addClass('addButton');

        $.ajax({
            url:"/users/removeFriend",
            type: "POST",
            data: {
                removeFriend : $(this).attr('id')
            },
            success: function(data){
                //console.log("Successfully removed friend");
                var alertTitle = "Remove ";
                alertTitle = alertTitle.concat(userToAddToFriends);
                alertTitle = alertTitle.concat(" to your Friends List");
            },
            error: function(data){
                //console.log(data.responseText);
                swal({title: "Error",text: data.responseText , type:"error"});
            }
        });
      }
    });

  });

  socket.on('server message', function(msg){
    //$('#messages').append($('<div class="messageSpacer"/>'));
    $('#messages').append($('<li class="serverMessage">').text(msg.text));
    document.getElementById("msgBox").scrollTop = document.getElementById("msgBox").scrollHeight;
  });
  socket.on('username message', function(msg){

  });

  // submitting the chat form
  $('form').submit(function(){
    if($('#m').val().length > 0) {
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
    }
    return false;
  });

  // Gets the lobby name and transfers that to the server as to connect to that specific chat socket io
  var url = window.location.pathname;
  var to = url.lastIndexOf('/') + 1;

  var chatToConnect =  url.substring(to,url.length);
  //alert(chatToConnect);
  // console.log("Trying to connect to chat: " + chatToConnect);
  socket.emit('connect to chat', chatToConnect);
  // console.log("chat connected to : " + chatToConnect);
  setTimeout(function() {
    // insecurely transfers a user's username
    // console.log("user_name is: " + loginData);
    socket.emit('username message', loginData);
  }, 50);



  //Hitting enter sends the message
  $("#m").keyup(function(e) {
      if(e.keyCode == 13) {
        if($('#m').val().length > 0) {
          //$('#messages').append($('<div class="messageSpacer"/>'));
          //$('#messages').append($('<div class="messageSpacer"><li class="selfMessage"> </div>').text( $('#m').val()));

          var html = '';
          html += '<div class="messageSpacer">';
          html +=   '<li class="selfMessage">' + $('#m').val() + '</li>';
          html += '</div>';
          $('#messages').append( html );


          document.getElementById("msgBox").scrollTop = document.getElementById("msgBox").scrollHeight;
          socket.emit('chat message', $('#m').val());
          $('#m').val('');
        }

        return false;
      }
  });


  /*
  THERE IS NO SERVER CODE.
  This is the code which enables a user to create an RTC voice chat stream lobby
  */
  //Start Password code
  var connection = new RTCMultiConnection();
/*  document.querySelector('#setup').onclick = function() {
      // room password has been set before calling "open" method
      connection.extra.password = prompt('Setup password for your room!');
      connection.open();
      this.disabled = true;
  };*/
  //Start Password Code
  /*    document.querySelector('#setup').onclick = function () {
        // room password has been set before calling "open" method
         connection.extra.password = prompt('Setup password for your room!');
        connection.open();
      };
  connection.onNewSession = function (session) {
    // set password for person who is trying to join the room
    connection.extra.password = prompt('Enter password to join this room.');
    connection.join(session);
  };
  connection.onRequest = function (userid, extra) {
    // validating password in "onRequest"
    if (extra.password != connection.extra.password)
      return alert('password: ' + extra.password + ' !== ' + connection.extra.password);
    connection.accept(userid, extra);
  };*/
  //End Password Code

  connection.session = {
      audio: true
  };
  connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: false
  };
  connection.onstream = function(e) {
      // audioContainer.insertBefore(e.mediaElement, audioContainer.firstChild);
  };


  var inSession = false;
  //sessions manages the current lobbies in the sub-lobby.
  var sessions = {};
  connection.onNewSession = function(session) {

      // console.log("Session: " + session.extra['session-name'] + " was created.");
      // inSession = true;
      if (sessions[session.sessionid]) {
        return;
      }
      sessions[session.sessionid] = session;
          // var tr = document.createElement('tr');
          // tr.innerHTML = '<td><span class="vertText">' + session.extra['session-name'] + '</span></td>' +
          //     '<td><button class="joinPrivateVoiceChat">Join</button></td>';
          // roomsList.insertBefore(tr, roomsList.firstChild);
          // var joinRoomButton = tr.querySelector('.joinPrivateVoiceChat');
          // joinRoomButton.setAttribute('data-sessionid', session.sessionid);
          // joinRoomButton.onclick = function() {
          //     this.disabled = true;
          //     var sessionid = this.getAttribute('data-sessionid');
          //     session = sessions[sessionid];
          //     if (!session) throw 'No such session exists.';

          //     // set password for person who is trying to join the room
          //     // connection.extra.password = prompt('Enter password to join this room.');

          //     connection.join(session);
      //};
  };
  //Start Password Code
  /*connection.onRequest = function(e) {
      // validating password in "onRequest"
       if (e.extra.password != connection.extra.password)
           return alert('password: ' + e.extra.password + ' !== ' + connection.extra.password);
      connection.accept(e);
  };
  connection.onstream = function(e) {
      document.body.appendChild(e.mediaElement);
  };*/
  //End Password Code

  var audioContainer = document.getElementById('audios-container') || document.body;
  var roomsList = document.getElementById('rooms-list');
  // document.getElementById('setup-new-conference').onclick = function() {
  //     this.disabled = true;
  //     connection.extra = {
  //        'session-name': document.getElementById('conference-name').value || 'Anonymous'
  //     };
  //     connection.open();
  // };

  // setup signaling to search existing sessions
  connection.connect();

  (function() {
              var uniqueToken = document.getElementById('unique-token');
              if (uniqueToken)
                  if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
                  else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace(/\./g, '-');
          })();

  setTimeout(function() {
      if(jQuery.isEmptyObject(sessions)) {
          // console.log("\n \n WE MAKE OUR OWN!!! \n \n ");
          // Make the voice chat
              // this.disabled = true;
          connection.extra = {
             'session-name': '0'//document.getElementById('conference-name').value || 'Anonymous'
          };
          connection.open();
      }
      else {
          // console.log("\n \n THERE IS ONE ALREADY!!!! \n \n ");

          //console.log("This many sessions made: " + sessions.length);
          for(sessionID in sessions) {
            break;
              //console.log("Session name: " + sessionName);
          }

          // Auto connect to the voice chat
          this.disabled = true;
          //var sessionid = '0'; // this.getAttribute('data-sessionid');
          session = sessions[sessionID]; //was sessionid
          if (!session) throw 'No such session exists.';

          // set password for person who is trying to join the room
         // connection.extra.password = prompt('Enter password to join this room.');

          connection.join(session);
      }
  }, 1000);
