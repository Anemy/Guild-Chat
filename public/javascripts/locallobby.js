/*this script will handle lobby creation and management*/
//Create a room
var isInitiator;

room = prompt("Enter Lobby Name:");

var sckt = io.connect();

if (room !== "") {
  console.log('Joining Lobby ' + room);
  sckt.emit('Create or Join', room);
}

sckt.on('Full', function (room){
  console.log('Lobby ' + room + ' is full');
});

sckt.on('Empty', function (room){
  isInitiator = true;
  console.log('Lobby ' + room + ' is empty');
});

sckt.on('Join', function (room){
  console.log('Making request to join Lobby ' + room);
  console.log('You are the initiator!');
});

sckt.on('log', function (array){
  console.log.apply(console, array);
});

//makes local client connection
 var socket = io();
  $('form').submit(function(){
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });

  socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
    document.getElementById("msgBox").scrollTop = document.getElementById("msgBox").scrollHeight;
  });

//Hitting enter sends the message
$(document).ready(function() {

$("#m").keyup(function(e) {
    if(e.keyCode == 13) {
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
        return false;
    }
});
});

