var balance = null,
name = prompt("enter username please") 
socket.emit('name', name);

socket.on('balance', function(data){
    balance = data
});

function sendBet(){
    var amount = document.getElementById("imputText")
    if(amount <= balance){
        socket.emit('bet', amount);  
    }
    return false
}


socket.on('leaderboard', function(data){
    for (let index = 0; index < data.length/2; index++) {
        data[index*2]
        
    }
});


