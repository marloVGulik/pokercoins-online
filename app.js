var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});
var sql = require('mysql');

var SQLcon = sql.createConnection({
  host: "10.102.32.78",
  user: "pokerface",
  password: "aScolT5N3EGXIxuI",
  database: "poker",
});

SQLcon.connect(function(err) {
  if (err) throw err;
  console.log("Connected to database");
});

app.get("/", function(req,res) {
  res.sendFile(__dirname + '/client/login.html');
  app.use(express.static('client'))
});
app.get("/game", function(req,res) {
  res.sendFile(__dirname + '/client/The-Game.html');
  app.use(express.static('client'));
});

serv.listen(25565);
console.log("its working");
console.log("accepting connections on 25565");

var SOCKET_LIST = {};
var clientNumber = 0
var currentPot = 0
var currentNmbOfClients = 0
var counter = 0
var winners= []
io.on('connection', function(socket){
  socket.loggedIn = false;
  socket.id = null;
  socket.name = "";
  socket.pass = "";
  socket.balance = 0;
  socket.displayName = "";

  currentNmbOfClients++
  setInterval(() => {
    io.emit('leaderboard')//retrieve names and balances from database in an array
  }, 3000);
  socket.on('bet', function(msg){
    if(msg < socket.balance){
      currentPot += msg
      socket.balance -= msg
      io.emit('currentPot', currentPot)
      SQLcon.query(`UPDATE users SET coins = ? WHERE name = ?`, [socket.balance, socket.name]);
      //update socket.balance to server
    }
  }),
  socket.on('endRound', function(){
    counter++
    console.log(counter)
    console.log(currentNmbOfClients)
    if (counter >= currentNmbOfClients) {
      io.emit('endRound')
      console.log("xd")
      for (let index = 0; index < currentNmbOfClients; index++) {
        io.emit('winner')
        console.log("xdd")
        
      }
    }
  }),
  socket.on('chosenWinner', function(data){
    winners.push(data)
    if(winners >= currentNmbOfClients){
     var winerr =  mode(winners)
      SQLcon.query(`UPDATE users SET coins = ? WHERE name = ?`, [currentPot +, winerr]);
      currentPot = 0;
      winner = ""
      counter = 0
      io.emit("newRound")
    }
  }),
    socket.id = clientNumber;
    clientNumber++;
    SOCKET_LIST[socket.id] = socket;
    console.log(`client ${socket.id} connected, connection established`);
    socket.on('disconnect', function(){
      console.log("client has disconnected, connection terminated");
      socket.loggedIn = false;
      currentNmbOfClients--
    });
    // Login part
    socket.on('login', function(input) {
      console.log(`Pass: ${input.pass}, username: ${input.name}`);
      if(input.pass != "" && input.name != "") {
        SQLcon.query(`SELECT * FROM users WHERE name = ? AND pass = ?`, [input.name, input.pass], function(error, result, fields) {
          if(result != undefined && result.length > 0) {
            socket.loggedIn = true;
            socket.id = result[0].ID;
            socket.balance = result[0].coins;
            socket.displayName = result[0].displayName;
            socket.name = result[0].name;
            socket.pass = result[0].pass;
            

            socket.emit('redirect', true);
            console.log("User logged in succesfully!");
          }
          if(result == undefined) console.log("CRITICAL ERROR!");
        })
      }
      
    });
    
});

function mode(array) {
  if (array.length == 0)
      return null;
  var modeMap = {};
  var maxEl = array[0], maxCount = 1;
  for (var i = 0; i < array.length; i++) {
      var el = array[i];
      if (modeMap[el] == null)
          modeMap[el] = 1;
      else
          modeMap[el]++;
      if (modeMap[el] > maxCount) {
          maxEl = el;
          maxCount = modeMap[el];
      }
  }
  return maxEl;
}


