var loggedIn = false;
var loginButton = document.getElementById('loginButton');
var hiddenItems = document.getElementsByClassName('hideThis');
var boxes = document.getElementsByClassName('box');

var game = {
    isReady: false,
    isPlaying: false,
    gameStarted: false,
    playerAmount: 0,
    coins: 0,
    currentBet: 0,
    gameBet: 0,
    totalGameBet: 0,
    name: "",
    displayName: "",

    updateHTML: function() {
        document.getElementById("totalCoins").innerHTML = `${game.coins} PC`;
        document.getElementById("currentBet").innerHTML = `${game.gameBet} PC`;
        document.getElementById("betCoins").innerHTML = `${game.currentBet} PC`;
        document.getElementById("totalBetCoins").innerHTML = `${game.totalGameBet} PC`;
        document.getElementById("coinsAfter").innerHTML = `${game.coins - game.currentBet} PC`;
        document.getElementById("coinsAfterWin").innerHTML = `${game.coins - game.currentBet + game.totalGameBet} PC`;
    }
}
socket.on('gameStart', function(data) {
    game.playerAmount = data.amountOfPlayers;
    game.currentBet = 0;
    game.totalGameBet = 0;
    game.gameBet = 0;
    game.updateHTML();
});
socket.on('resetScreen', function(data) {
    game.coins = data.coins;
    game.updateHTML();
});
socket.on('newRound', function(data) {
    var button = document.getElementById("readyButton");
    button.style.borderColor = "#FF0000";
    button.style.color = "#FF0000";
    game.isReady = false;
    game.totalGameBet = data.totalGameBet;
    game.updateHTML();
});

if(socket == undefined) {
    throw console.error("Error: socket is undefined!");
}