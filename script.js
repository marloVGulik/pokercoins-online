var name = null;
name = prompt("enter username please") 
socket.emit('name', name);

socket.on('team', function(data){

});



