const socket = io.connect('http://127.0.0.1:25565');
var loggedIn = false;
var loginButton = document.getElementById('loginButton');
var hiddenItems = document.getElementsByClassName('hideThis');
var boxes = document.getElementsByClassName('box');

socket.on('checkLogin', function(isLoggedIn) {
    if(isLoggedIn) {
        loggedIn = true;
        loginButton.value = `YOU'RE LOGGED IN!`;
        hideThis(false);
    } else {
        loggedIn = false;
        loginButton.value = 'LOGIN';
        hideThis(true);
    }
});
socket.on('updateBet', function(data) {
    game.updateBet(data);
})

function login() {
    if(!loggedIn) {
        var data = {
            username: document.getElementById("username").value,
            password: document.getElementById("password").value
        };
        socket.emit('login', data);
    }
}
function hideThis(shouldBeHidden) {
    for(var i = 0; i < hiddenItems.length; i++) {
        if(hiddenItems[i].classList.contains('hidden') && shouldBeHidden) {
            hiddenItems[i].classList.remove('hidden');
        } else if(!hiddenItems[i].classList.contains('hidden') && !shouldBeHidden) {
            hiddenItems[i].classList.add('hidden');
        }
    }
}

var game = {
    coins: 0,
    currentBet: 0,
    gameBet: 0,
    name: "",
    displayName: "",
    submitBet: function() {
        var bet = document.getElementById("bet").value;
        if(bet >= this.gameBet) {
            socket.emit('bet', bet);
        }
    },
    updateBet: function(data) {
        document.getElementById("totalCoins").innerHTML = `Total coins: ${data.totalCoins}`;
        document.getElementById("betCoins").innerHTML = `Your bet coins: ${data.betCoins}`;
        document.getElementById("totalBetCoins").innerHTML = `The total amount of coins in the bet: ${data.totalBetCoins}`;
        document.getElementById("coinsAfter").innerHTML = `Coins after losing: ${data.coinsAfter}`;
        document.getElementById("coinsAfterWin").innerHTML = `Coins after winning: ${data.coinsAfterWinning}`;
    },
    init: function() {

    }
}
game.update();