function changeBet(amount) {
    if(0 <= game.currentBet + amount && game.currentBet + amount <= game.coins && game.gameStarted && game.isPlaying) {
        game.currentBet += amount;
    }
    document.getElementById("betCoins").innerHTML = game.currentBet + " PC";
}
function submitBet() {
}
function callBet() {
    if(game.gameStarted && game.isPlaying) {
        game.currentBet = game.gameBet;
        document.getElementById("betCoins").innerHTML = game.currentBet + " PC";
        socket.emit('call');
    }
}
function raiseBet() {
    if(game.currentBet >= game.gameBet && game.currentBet <= game.coins && game.gameStarted && game.isPlaying) {
        socket.emit('raise', game.currentBet);
    }
}
function foldBet() {
    if(game.gameStarted) {
        isPlaying = false;
        socket.emit('fold');
    }
}
function readyBet() {
    var button = document.getElementById("readyButton");
    if(!game.isReady && game.currentBet == game.gameBet) {
        button.style.borderColor = "#00FF00";
        button.style.color = "#00FF00";
        game.isReady = true;
    } else {
        button.style.borderColor = "#FF0000";
        button.style.color = "#FF0000";
        game.isReady = false;
    }
    socket.emit('readyButton', game.isReady);
}
socket.on('newRaise', function(data) {
    console.log("test");
    document.getElementById("totalBetCoins").innerHTML = data.currentGameBet + " PC";
    game.gameBet = data.currentGameBet;
    game.totalGameBet = data.totalGameBet;
    if(game.isPlaying) {
        if(game.gameBet != game.currentBet) {
            var button = document.getElementById("readyButton");
            button.style.borderColor = "#FF0000";
            button.style.color = "#FF0000";
        }
    }
    game.updateHTML();
});
socket.on('finishGame', function(playerArray) {
    const deleteChildNodes = document.getElementById("playerList");
    while(deleteChildNodes.firstChild) {
        deleteChildNodes.removeChild(deleteChildNodes.firstChild);
    }
    if(game.isPlaying) {
        for(var i = 0; i < playerArray.length; i++) {
            console.log(playerArray[i]);
            var element = document.createElement("li");
            var buttonElement = document.createElement("button");
            buttonElement.onclick = function(){choosePlayer(this.id)};
            buttonElement.id = playerArray[i];
            buttonElement.innerHTML = playerArray[i];
            buttonElement.classList.add("col-12");
            buttonElement.classList.add("buttons");
            element.appendChild(buttonElement);
            document.getElementById("playerList").appendChild(element);
        }
        document.getElementById("playerSelection").classList.remove("isHidden");
    }
});
function choosePlayer(playerName) {
    console.log(playerName);
    document.getElementById("playerSelection").classList.add("isHidden");
    socket.emit('chosePlayerName', playerName);
}