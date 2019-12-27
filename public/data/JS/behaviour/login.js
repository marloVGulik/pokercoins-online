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
        for(var i = 0; i < document.getElementsByClassName("hideNoLogin").length; i++) {
            if(document.getElementsByClassName("hideNoLogin")[i].classList.contains("isHidden")) {
                document.getElementsByClassName("hideNoLogin")[i].classList.remove("isHidden");
            }
        }
        if(!game.isPlaying) {
            for(var i = 0; i < document.getElementsByClassName("hideNoLogin").length; i++) {
                if(!document.getElementsByClassName("hideNoLogin")[i].classList.contains("isHidden")) {
                    document.getElementsByClassName("hideNoLogin")[i].classList.add("isHidden");
                }
            }
        }
    } else {
        loggedIn = false;
        game.isPlaying = false;
        loginButton.value = 'LOGIN';
        hideThis(true);
        for(var i = 0; i < document.getElementsByClassName("hideNoLogin").length; i++) {
            if(!document.getElementsByClassName("hideNoLogin")[i].classList.contains("isHidden")) {
                document.getElementsByClassName("hideNoLogin")[i].classList.add("isHidden");
            }
        }
    }
});
socket.on('firstLogin', function(data) {
    document.getElementById('totalCoins').innerHTML = `Total PC: ${data.coins}`;
    game.coins = data.coins;
    hideThis(false);
});
socket.on('gameStart', function() {
    game.isPlaying = true;
    game.gameStarted = true;
});