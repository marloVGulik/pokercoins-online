var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});

app.get("/", function(req,res) {
  res.sendFile(__dirname + '/client/The-Game.html');
  app.use(express.static('client'))
});

serv.listen(25565);
console.log("its working");
console.log("accepting connections on 25565");

var SOCKET_LIST = {};
var clientNumber = 0

// var main = io.of('/mainMenu');
io.sockets.on('connection', function(socket){
    socket.id = clientNumber;
    clientNumber++;
    SOCKET_LIST[socket.id] = socket;
    console.log(`client ${socket.id} connected, connection established`);
    socket.on('disconnect', function(){
      console.log("client has disconnected, connection terminated");
  	});
});

io.on('connection', function(socket){ //first joining
  socket.on('name', function(msg){
    socket["nickName"] = msg;
    console.log(`name recieved, client ${socket.id} is now named ${socket.nickName}`);
    //retrieve balance from database assoicated with username
    //socket.emit('balance' balance)
  });
});
