var game = (function Game (id) {
    this.id = id;
    this.playerA = null;
    this.playerB = null;
    this.playerACode = null;
    this.playerBCode = null;
    this.playerAGuesses = 0;
    this.playerBGuesses = 0;
    this.MAX_GUESSES = 10;
    this.aborted = false;
    this.winner = null;

    /*Game states are identified as follows ...*/
    this.gameState = () => {
        if(this.winner != null) {
            return "finished";
        } else if(this.playerA !== null && this.playerB === null) {
            return "only A";
        } else if(this.playerA === null && this.playerB !== null) {
            return "only B";
        } else if(this.playerA !== null && this.playerB !== null) {
            return "both";
        } else if(this.playerA === null && this.playerB === null) {
            return "none";
        } else if(this.playerACode !== null && this.playerBCode === null) {
            return "only A ready";
        } else if(this.playerACode === null && this.playerBCode !== null) {
            return "only B ready";
        } else if(this.playerACode !== null && this.playerBCode !== null) {
            return "both ready";
        } else if(this.playerAGuesses === 10 && this.playerBGuesses < 10) {
            return "A finished";
        } else if(this.aborted) {
            return "aborted";
        } else return "in process";
    }

    this.setCode = (code, type) => {
        if(type === "A") this.playerACode = code;
        else if(type === "B") this.playerBCode = code;
        else console.error("Invalid player type specified!");
    }

    this.getCode = (type) => {
        if(type === "A") return this.playerACode;
        else if(type === "B") return this.playerBCode;
        else console.error("Invalid player type specified!");
    }

    this.addPlayer = (wsCon) => {
        let state = this.gameState();
        if(state === "none" || state === "only B") {
            this.playerA = wsCon;
            return "A";
        }
        else if(state === "only A") {
            this.playerB = wsCon;
            return "B";
        }
        else {
            console.error("Cannot add this player!");
            return null;
        }
    }

    this.setWinner = (type) => {
        if(type === "A") this.winner = this.playerA;
        else this.winner = this.playerB;
    }

    this.isAborted = () => {
        return this.aborted;
    }

    this.isFinished = ()  => {
        return this.gameState() === "finished";
    }

    this.abort = () => { this.aborted = true; }
});
module.exports = game;