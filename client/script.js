const socket = io.connect('http://10.102.32.102:25565/');
var selectingWinner = false

socket.emit('name', name);

socket.on('balance', function(data){
    balance = data
});

function sendBet(){
    if(selectingWinner == false){
        var amount = document.getElementById("input")
        socket.emit('bet', amount.value);
    } else{
        socket.emit('chosenWinner',  document.getElementById("imputText"))
    }
}

function endRound(){
socket.emit('endRound')
}

function login() {
    console.log("TEST");
    var userIn = {name: document.getElementById("userName").value, pass: document.getElementById("userPass").value};
    socket.emit('login', userIn);
}

socket.on('currentPot', function(data){
    document.getElementById("currentPot").innerHTML = data
});
socket.on('redirect', function(data) {
    if(data) {
        var items = document.getElementsByClassName('main');
        for(var i = 0; i < items.length; i++) {
            items[i].style.display = 'block';
        }
        console.log("Success!");
    }
});
socket.on('leaderboard', function(data){
    // for (let index = 0; index < data.length; index++) {
    //     document.getElementById(index).innerHTML = data[index]
    // }
});
socket.on('winner', function(){
 selectingWinner = true
});

socket.on("newRound", function(){
    selectingWinner = false
    console.log("newround")
   });
   

