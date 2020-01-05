const hostname = '127.0.0.1';
const port = '5500';
const sql = require('mysql');
const express = require('express');
const sockets = require('socket.io');

// SQL
var SQLCon = sql.createConnection({
    host: "localhost",
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
var totalBet = 0;
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
        totalBet = 0;
        playingPlayers = [];
        playingAmount = allSockets.length;
        playingAmount = 0;
        allSockets.forEach(function(socket) {
            playingAmount++;
            socket.currentBet = 0;
            socket.isPlaying = true;
            socket.isReady = false;
            playingPlayers.push(socket.displayName);
        });
        io.emit('gameStart', {amountOfPlayers: playingAmount});
        var sendData = {
            totalGameBet: totalBet,
        }
        io.emit('newRound', sendData);
    }
    gameStarted = true;
}
function endGame() {
    io.emit('finishGame', playingPlayers);

    
    var sendData = {
        totalGameBet: totalBet,
    }
    io.emit('newRound', sendData);
    allSockets.forEach(function(socket) {
        socket.isReady = false;
    });
}
function winningPlayerChoosing() {
    var infoArray = [];
    chosenPlayers.forEach(function(playerName) {
        var createNewItem = true;
        infoArray.forEach(function(data) {
            if(data.name == playerName) {
                createNewItem = false;
                data.amount++;
            }
        });
        if(createNewItem) {
            infoArray.push({name: playerName, amount: 1});
        }
        console.log(playerName);
    });
    var chosenItem = {name: "", amount: 0};
    infoArray.forEach(function(item) {
        if(item.amount > chosenItem.amount) chosenItem = item;
    });
    console.log(`Players chose: ${chosenItem.name} as the winner, transferring coins and starting new round...`);

    allSockets.forEach(function(socket) {
        socket.dbCoins -= socket.currentBet;
        if(socket.displayName == chosenItem.name) {
            socket.dbCoins += totalBet;
        }
        SQLCon.query("UPDATE users SET coins = ? WHERE displayname = ?", [socket.dbCoins, socket.displayName], function(err, result) {
            if(err) {
                throw err;
            }
            else {
                console.log(result);
            }
        });
        console.log(`Transferred coins to ${socket.displayName}`);

        socket.coins = socket.dbCoins;
        sentData = {
            coins: socket.dbCoins
        };
        socket.emit('resetScreen', sentData);
    });
    var sendData = {
        totalGameBet: totalBet,
    }
    io.emit('newRound', sendData);
    round = 0;
}
function newRound() {
    var newRoundShouldHappen = true
    allSockets.forEach(function(socket) {
        if(!socket.isReady) {
            var isArrayEmpty = true;
            playingPlayers.forEach(function(playerDName) {
                isArrayEmpty = false;
                if(playerDName == socket.displayName) {
                    newRoundShouldHappen = false;
                    console.log("Player is playing and not ready! " + playerDName);
                }
            });
            if(isArrayEmpty) {
                newRoundShouldHappen = false;
            }
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
            allSockets.forEach(function(socket) {
                socket.isReady = false;
                console.log(socket.currentBet + " " + socket.displayName);
                console.log(socket.oldBet + " " + socket.displayName);
                totalBet += (socket.currentBet - socket.oldBet);
                socket.oldBet = socket.currentBet;
            });
            console.log(totalBet);

            var sendData = {
                totalGameBet: totalBet,
            }
            io.emit('newRound', sendData);
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
    socket.oldBet = 0;
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
                socket.isPlaying = false;
                console.log("Removed user number " + i);
            }
        }
    });

    // GAME FUNCTIONALITY:
    socket.on('call', function() {
        if(gameStarted && socket.isPlaying) {
            socket.currentBet = gameBet;
        }
    });
    socket.on('raise', function(bet) {
        if(bet > gameBet && gameStarted && socket.isPlaying) {
            console.log(gameBet);
            socket.currentBet = bet;
            gameBet = bet;
            io.emit("newRaise", {currentGameBet: gameBet, totalGameBet: totalBet});
        }
    });
    socket.on('fold', function() {
        if(gameStarted) {
            playingAmount--;
            socket.isPlaying = false;
            for(var i = 0; i < playingPlayers.length; i++) {
                if(playingPlayers[i] == socket.displayName) {
                    console.log(`Player: ${playingPlayers[i]} has folded!`);
                    playingPlayers.splice(i, 1);
                }
            }
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
