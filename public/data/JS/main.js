const socket = io.connect('http://127.0.0.1:25565');
var loggedIn = false;
var loginButton = document.getElementById('loginButton');
var hiddenItems = document.getElementsByClassName('hideThis');
var boxes = document.getElementsByClassName('box');

var game = {
    isReady: false,
    isPlaying: false,
    coins: 0,
    currentBet: 0,
    gameBet: 0,
    name: "",
    displayName: "",
}