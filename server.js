const hostname = '127.0.0.1';
const port = '25565';
const sql = require('mysql');
const express = require('express');
const socket = require('socket.io');

// SQL
var SQLCon = sql.createConnection({
    host: "127.0.0.1",
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

io.on('connection', function(socket) {
    // Socket data
    socket.loggedIn = false;
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
                    console.log(socket.currentCoins);
                    socket.finishLogin();
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
    socket.on('bet', function(bet) {
        if(bet >= gameBet) {
            gameBet = bet;
        }
    })

    allSockets.push(socket);
    console.log(`User connected: ${allSockets.length - 1}`);
});

setInterval(function() {
    for(var i = 0; i < allSockets.length; i++) {
        allSockets[i].finishLogin();
    }
}, 1000);