//Game setup: shared between client and server

(function(exports){
    exports.WS_URL = "ws://localhost:3000";
    exports.MAX_GUESSES = 12;
})(typeof exports === "undefined" ? (this.Setup = {}) : exports);