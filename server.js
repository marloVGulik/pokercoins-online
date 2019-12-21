const hostname = '127.0.0.1';
const port = '25565';
const sql = require('mysql');
const express = require('express');
const socket = require('socket.io');

// SQL
var SQLCon = sql.createConnection({
    host: "192.168.0.104",
    user: "pokerface",
    password: "maLDgGriKadrkyrh",
    database: "poker"
});
SQLCon.connect(function(err) {
    if(err) {
        throw err;
    }
    console.log("Database connection established!");
});


// dependencies
const app = express();
const server = app.listen(port, function() {
	console.log(`listening on ${hostname}:${port}`)
});
app.use(express.static('public'));

const io = socket(server);
var allSockets = [];


// Start here
var gameBet = 0;
var chosenPlayers = [];

io.on('connection', function(socket) {
    // Socket data
    socket.loggedIn = false;
    socket.isReady = false;
    socket.isPlaying = false;
    socket.dbCoins = 0;
    socket.currentCoins = 0;
    socket.currentBet = 0;
    socket.displayName = "";
    socket.name = "";
    socket.finishLogin = function() {
        socket.emit('checkLogin', socket.loggedIn);
    }

    socket.on('login', function(data) {
        if(data.password.length != 0 && data.username.length != 0) {
            SQLCon.query('SELECT * FROM users WHERE username = ? AND password = ?', [data.username, data.password], function(err, result, fields) {
                if(err) {
                    throw err;
                }
                if(result != undefined && result.length > 0) {
                    socket.loggedIn = true;
                    socket.name = result[0].username;
                    socket.displayName = result[0].displayname;
                    socket.currentCoins = result[0].coins;
                    socket.dbCoins = result[0].coins;
                    socket.isPlaying = true;
                    console.log(socket.currentCoins);
                    socket.finishLogin();

                    var emitData = {coins: socket.dbCoins, displayName: socket.displayName};
                    socket.emit('firstLogin', emitData);
                }
            })
        } else {
            console.log("Password length incorrect!");
        }
    });
    socket.on('disconnect', function() {
        socket.loggedIn = false;
        for(var i = 0; i < allSockets.length; i++) {
            if(allSockets[i].id == socket.id) {
                allSockets.splice(i, 1);
                console.log("Removed user number " + i);
            }
        }
    });

    // GAME FUNCTIONALITY:
    socket.on('call', function() {
        socket.currentBet = gameBet;
    });
    socket.on('raise', function(bet) {
        if(bet > gameBet) {
            console.log(gameBet);
            gameBet = bet;
            io.emit("newRaise", gameBet);
        }
    });
    socket.on('fold', function() {

    });
    socket.on('readyButton', function(isPLayerReady) {
        if(socket.isPlaying) {
            socket.isReady = isPLayerReady;
            var endGame = true;
            for(var i = 0; i < allSockets.length; i++) {
                if(!allSockets[i].isReady && allSockets[i].isPlaying) {
                    endGame = false;
                }
            }
            if(endGame) {
                var playerArray = [];
                for(var i = 0; i < allSockets.length; i++) {
                    if(allSockets[i].isPlaying) {
                        playerArray.push(allSockets[i].displayName);
                    }
                }
                io.emit('finishGame', playerArray);
            }
        }
    });
    socket.on('chosePlayerName', function(playerDisplayName) {
        var playingAmount = 0;
        for(var i = 0; i < allSockets.length; i++) {
            if(allSockets[i].isPlaying) playingAmount++;
        }
        if(socket.isPlaying) {
            chosenPlayers.push(playerDisplayName);
        }
        if(chosenPlayers.length == playingAmount) newGame();
    });

    allSockets.push(socket);
    console.log(`User connected: ${allSockets.length - 1}`);
});

function newGame() {
    var chosenPlayerDataArray = [];
    var firstRun = true;
    chosenPlayers.forEach(function(playerName) {
        if(firstRun) {
            chosenPlayerDataArray.push({name: playerName, amount: 1});
        } else {
            var addToArray = false;
            chosenPlayerDataArray.forEach(function(object) {
                if(object.name == playerName) {
                    object.amount++
                } else {
                    addToArray = true;
                }
            });
            if(addToArray) {
                chosenPlayerDataArray.push({name: playerName, amount: 1});
            }
        }
    });
    console.log("STARTING NEW GAME!");
}

// Login check
setInterval(function() {
    for(var i = 0; i < allSockets.length; i++) {
        allSockets[i].finishLogin();
    }
}, 1000);