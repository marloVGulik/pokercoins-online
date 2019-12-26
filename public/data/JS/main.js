const socket = io.connect('http://84.87.159.149:25565');
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
    name: "",
    displayName: "",
}
socket.on('resetScreen', function() {
    document.getElementById('totalCoins').innerHTML = `Total PC: ${data.coins}`;
    game.playerAmount = 0;
});