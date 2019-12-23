const hostname = '127.0.0.1';
const port = '25565';
const sql = require('mysql');
const fs = require('fs');
const express = require('express');
const sockets = require('socket.io');

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

const io = sockets(server);
var allSockets = [];


// Start here
var gameBet = 0;
var round = 0;
var chosenPlayers = [];
var playingPlayers = [];
var playingAmount = 0;
var gameStarted = false;

function startGame() {
    var notReadyAmount = allSockets.length;
    for(var i = 0; i < allSockets.length; i++) {
        if(allSockets[i].isReady) {
            notReadyAmount--;
        }
    }
    if(notReadyAmount == 0) {
        console.log("STARTING GAME!");
        gameBet = 0;
        playingPlayers = [];
        playingAmount = allSockets.length;
        allSockets.forEach(function(socket) {
            socket.currentBet = 0;
            socket.isPlaying = true;
            socket.isReady = false;
            playingPlayers.push(socket.displayName);
            socket.emit('gameStart');
            socket.emit('newRound');
        });
    }
    gameStarted = true;
}
function endGame() {
    round = 0;
    io.emit('finishGame', playingPlayers);
    io.emit('newRound');
}
function winningPlayerChoosing() {
    var infoArray = [];
    var firstRun = true;
    chosenPlayers.forEach(function(playerName) {
        if(firstRun) {
            infoArray.push({name: playerName, amount: 1});
        }
        console.log(playerName);
    });
}
function newRound() {
    var newRoundShouldHappen = true
    allSockets.forEach(function(socket) {
        if(!socket.isReady) {
            newRoundShouldHappen = false;
        }
    });
    if(newRoundShouldHappen) {
        if(round == 0) {
            startGame();
            round++;
        } else if(round == 4) {
            endGame();
            round++;
        } else if(round == 5) {
            winningPlayerChoosing();
        } else if(0 < round && round < 4){
            round++;
            console.log("New round starting: " + round);
            io.emit('newRound');
            allSockets.forEach(function(socket) {
                socket.isReady = false;
            });
        } else {
            throw "Round error";
        }
    }
}

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

    // Login
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
    // Logout or disconnect
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
        if(gameStarted) {
            socket.currentBet = gameBet;
        }
    });
    socket.on('raise', function(bet) {
        if(bet > gameBet && gameStarted) {
            console.log(gameBet);
            gameBet = bet;
            io.emit("newRaise", gameBet);
        }
    });
    socket.on('fold', function() {
        if(gameStarted) {
            playingAmount--;
            socket.isPlaying = false;
        }
    });
    socket.on('readyButton', function(isPLayerReady) {
        socket.isReady = isPLayerReady;
        newRound();
    });
    socket.on('chosePlayerName', function(playerDisplayName) {
        console.log(playerDisplayName);
        playingAmount = 0;
        for(var i = 0; i < allSockets.length; i++) {
            if(allSockets[i].isPlaying) playingAmount++;
        }
        if(socket.isPlaying) {
            chosenPlayers.push(playerDisplayName);
        }
    });

    allSockets.push(socket);
    console.log(`User connected: ${allSockets.length - 1}`);
});

// Login check
setInterval(function() {
    for(var i = 0; i < allSockets.length; i++) {
        allSockets[i].finishLogin();
    }
}, 1000);
