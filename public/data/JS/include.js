var includes = [
    "./data/JS/main.js",
    "./data/JS/behaviour/login.js",
    "./data/JS/behaviour/game/betting.js",
];

includes.forEach(function(source) {
    var element = document.createElement("script");
    element.src = source;
    document.body.appendChild(element);
})