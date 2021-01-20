//Game setup: shared between client and server

//if exports is undefined - we are in the browser, so we create an object. Otherwise we are on the server side and return exports object itself
(function(exports){
    exports.WS_URL = "ws://localhost:3000";
    exports.MAX_GUESSES = 10;
})(typeof exports === "undefined" ? (this.Setup = {}) : exports);