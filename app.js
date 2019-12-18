var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});
var sql = require('mysql');

var SQLcon = sql.createConnection({
  host: "10.102.32.78",
  user: "pokerface",
  password: "aScolT5N3EGXIxuI"
});

SQLcon.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

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
  });
});
