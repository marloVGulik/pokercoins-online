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

socket.on('checkLogin', function(isLoggedIn) {
    if(isLoggedIn) {
        loggedIn = true;
        game.isPlaying = true;
        loginButton.value = `YOU'RE LOGGED IN!`;
    } else {
        loggedIn = false;
        game.isPlaying = false;
        loginButton.value = 'LOGIN';
        hideThis(true);
    }
});
socket.on('firstLogin', function(data) {
    document.getElementById('totalCoins').innerHTML = `Total PC: ${data.coins}`;
    game.coins = data.coins;
    hideThis(false);
})