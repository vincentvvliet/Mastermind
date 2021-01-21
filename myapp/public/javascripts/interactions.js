//@ts-check

var intervals = {};
var audioWin = new Audio('/../data/audio/win.mp3');
var audioGameOver = new Audio('/../data/audio/gameOver.mp3');

//main utility for the game
function GameControls(socket, myTable, opponentTable) {
    var gameControls = this; //to prevent weird "this" malfunctioning

    this.playerType = null;
    this.state = "passive";
    this.MAX_GUESSES = Setup.MAX_GUESSES;
    this.numGuesses = 0;

    this.opponentTable = opponentTable;
    this.myTable = myTable;
    this.colourPicker = new ColourPicker(this);
    this.gameConsole = document.querySelector(".game-console");

    this.winner = null;
    this.myCode = null;
    this.oppCode = null;

    //interactive utilities. CurrentGuess is initially set to myTable to enable code selection
    this.currentGuess = (function() {
        let t = document.getElementsByTagName("thead")[2].rows.item(1).cells[0].getElementsByTagName("div");
        return t;
    })();
    this.cursorPos = 0;    //should be in [0,3]
    this.cursor = this.currentGuess[this.cursorPos];
    this.cursor.className += " cursor";

    //some functions
    this.getPlayerType = function() { return gameControls.playerType; }
    this.setPlayerType = function(type) { gameControls.playerType = type; }

    //restricting moves: player cannot select random pegs in current row: only previous or current ones
    this.addEventListenersCurrentPos = function(pos) {
        this.currentGuess[pos].addEventListener("click", function() {
            gameControls.cursor.classList.remove("cursor");
            gameControls.cursorPos = pos;
            gameControls.cursor = gameControls.currentGuess[gameControls.cursorPos];
            gameControls.cursor.className += " cursor";
         });
    }
    
    //restricting moves: player cannot select pegs in rows of the previous guesses
    this.removeEventListenersFromCurrentRow = function() {
        for(let i = 0; i < 4; i++) {
            let el = gameControls.currentGuess[i];
            let elClone = el.cloneNode(true);
            el.parentNode.replaceChild(elClone, el);
        }
    }

    //check the guess and determine how many blacks and whites to give
    this.checkGuess = function(choiceCode) {
        let whites = 0;
        let blacks = 0;
        //make a deep copy
        let code = JSON.parse(JSON.stringify(gameControls.oppCode));
        let choice = JSON.parse(JSON.stringify(choiceCode));
        
        //find all blacks
        let i=0;
        while(i < code.length){
            if(code[i] === choice[i]) {
                code.splice(i,1);
                choice.splice(i,1);
                blacks++;
            } else i++;
        }

        //find all whites from the remaining ones
        i = 0;
        let j = 0;
        outer:
        while(i < code.length) {
            while(j < choice.length){
                if(code[i] === choice[j]) {
                    code.splice(i,1);
                    choice.splice(j,1);
                    whites++;
                    j=0;
                    continue outer;
                }
                j++;
            }
            i++;
            j=0;
        }
        //we have a winner if all feedback pegs are black. In this case the amount of guesses of player B is less than max
        if(blacks === gameControls.oppCode.length) gameControls.winner = gameControls.playerType;
        //get the feedback
        return gameControls.updateFeedback(blacks, whites);
    }

    //render and return the feedback
    this.updateFeedback = function(blacks, whites) {
        let fbRow = gameControls.opponentTable[gameControls.MAX_GUESSES - 1 - gameControls.numGuesses].slice(4);
        let feedback = ["empty", "empty", "empty", "empty"];
        for(let i = 0; i < blacks; i++) {
            fbRow[i].className = "feedback black";
            feedback[i] = "black";
        }
        for(let i = 0; i < whites; i++) {
            fbRow[blacks + i].className = "feedback white";
            feedback[blacks + i] = "white";
        }
        return feedback;
    }

    //render the guess opponent has made
    this.renderOpponentGuess = function(guess, feedback) {
        //if I am player A, opponent's guess number is equal to my guesses when I receive this message
        //if I am player B, opponent's guess number is equal to my guesses + 1 when I receive this message
        let oppGuessNumber = 0;
        if(gameControls.playerType === "A") oppGuessNumber = gameControls.numGuesses;
        else oppGuessNumber = gameControls.numGuesses + 1;
        //update the opponent's guess number
        document.getElementById("opponent-guesses").textContent = "Guesses: " + oppGuessNumber;

        //render the guess and feedback
        let guessRow = gameControls.myTable[this.MAX_GUESSES - oppGuessNumber]; 
        gameControls.gameConsole.textContent = Status.opponent;
        //render the guess
        for(let i = 0; i < guess.length; i++) {
            guessRow[i].classList.remove("empty");
            guessRow[i].className += " " + guess[i];
        }
        //render the feedback
        for(let i = 0; i < feedback.length; i++) {
            guessRow[guess.length + i].classList.remove("empty");
            guessRow[guess.length + i].className += " " + feedback[i];
        }
    }

    //move the cursor either to the next position or to the specified position
    this.moveCursor = (pos) => {
        //if the state is "passive", no interactivity is allowed
        if(this.state !== "active") return;

        console.log("Cursor position: " + this.cursorPos);
        //if the cursor is the last one, enable the submit button
        if(this.cursorPos === 3) {
            this.colourPicker.submitButton.disabled = false;
        }
        //if position is less than three, update the position
        if(pos < 3) {
            this.cursor.classList.remove("cursor");
            this.cursorPos = pos + 1;
            this.cursor = this.currentGuess[this.cursorPos];
            this.cursor.className += " cursor";
            this.addEventListenersCurrentPos(this.cursorPos);
        }
    };

    //submit the player's (my) code
    this.submitCode = function() {
        let code = [];
        for(let i = 0; i < 4; i++) code.push(gameControls.currentGuess[i].classList.item(1));
        gameControls.myCode = code;

        //send the code to the server 
        if(gameControls.playerType == "A") {
            let msg = Messages.O_PLAYER_A_CODE;
            msg.data = code;
            socket.send(JSON.stringify(msg));
        } else {
            let msg = Messages.O_PLAYER_B_CODE;
            msg.data = code;
            socket.send(JSON.stringify(msg));
        }

        console.log("My code: " + gameControls.myCode);

        //disable interactivity
        gameControls.cursor.classList.remove("cursor");
        gameControls.removeEventListenersFromCurrentRow();
        //disable submit button and make the state passive
        gameControls.colourPicker.submitButton.disabled = true;
        gameControls.state = "passive";
       
        //update the row and the cursor
        gameControls.currentGuess = gameControls.opponentTable[gameControls.MAX_GUESSES - 1];
        gameControls.cursorPos = 0;
        gameControls.cursor = gameControls.currentGuess[0];
        gameControls.cursor.className += " cursor";

        //opponent has already sent the code - the game can be started
        //otherwise wait for the incoming message of type T.PLAYER-[AB]-CODE
        if(this.oppCode != null) gameControls.startGame();
        else gameControls.gameConsole.textContent = Status.iSubmittedCode;
    }

    //both players have chosen the code
    this.startGame = function() {
        setTimer();
        gameControls.gameConsole.textContent = gameControls.playerType === "A" ? Status.playerAIntro : Status.playerBIntro;
        //player A guesses first
        if(gameControls.playerType === "A") gameControls.startGuess();
    }

    this.finishGame = function() {
        //game is finished, not aborted
        //TODO add win sound for only winner, gameOver sound for only loser
        // audioGameOver.play();
        audioWin.play();

        //disable everything, stop the timer
        gameControls.colourPicker.submitButton.disabled = true;
        stopTimer();
        //render the opponent's code
        document.getElementsByTagName("thead")[0].rows[1].hidden = false;

        //call renderOpponentCode with empty array of length 4 to reveal code
        gameControls.renderOpponentCode(["","","",""], "endGame");

        //give the link to play again
        gameControls.gameConsole.innerHTML = gameControls.playerType == gameControls.winner ? Status.won : Status.lost;
        gameControls.gameConsole.innerHTML += Status.playAgain;
    }

    //submit the current guess
    this.submitGuess = function() {
        gameControls.cursor.classList.remove("cursor");
        let choice = [];
        for(let i = 0; i < 4; i++) choice.push(gameControls.currentGuess[i].classList[1]);

        //get the feedback
        let feedback = gameControls.checkGuess(choice);
        console.log(choice);
        console.log("My choice: " + choice + "; feedback: " + feedback);

        gameControls.numGuesses++;
        document.getElementById("my-guesses").textContent = "Guesses: " + gameControls.numGuesses;
        
        //disable interactivity
        gameControls.removeEventListenersFromCurrentRow();
        //In this case the game is over

        //send current guess to the server
        if(gameControls.playerType === "A") {
            let msg = Messages.O_PLAYER_A_GUESS;
            msg.data.guess = choice;
            msg.data.feedback = feedback;
            socket.send(JSON.stringify(msg));
        } else {
            let msg = Messages.O_PLAYER_B_GUESS;
            msg.data.guess = choice;
            msg.data.feedback = feedback;
            socket.send(JSON.stringify(msg));
        }

        //but the game already has a winner
        if(gameControls.numGuesses === gameControls.MAX_GUESSES || gameControls.winner != null) {
            gameControls.state = "passive";
            //this means it is player A last guess and it was incorrect: player B is the winner automatically
            if(gameControls.winner == null) gameControls.winner = "B";
            
            let msg = Messages.O_GAME_WON_BY;
            msg.data = gameControls.winner;
            socket.send(JSON.stringify(msg));
            return;
        }

        gameControls.gameConsole.textContent = Status.continuePlaying;
        //update the row and cursor
        gameControls.currentGuess = gameControls.opponentTable[gameControls.MAX_GUESSES - 1 - gameControls.numGuesses];
        gameControls.cursorPos = 0;
        gameControls.cursor = gameControls.currentGuess[0];
        gameControls.cursor.className += " cursor";

        //disable interactivity
        gameControls.colourPicker.submitButton.disabled = true;
        gameControls.state = "passive";
    };

    //when the player is allowed to guess, enable interactivity
    this.startGuess = function() {
        gameControls.state = "active";
        gameControls.addEventListenersCurrentPos(0);
    }

    //At start of game: initialise the code but it remains hidden
    //At end of game: reveal the code
    this.renderOpponentCode = function(code, type) {
        let codeRow = document.getElementsByTagName("thead")[0].rows.item(1).cells[0].getElementsByTagName("div");
        for(let i = 0; i < code.length; i++) {
            //at the end of game, remove code class to show code underneath
            if (type === "endGame") {
                codeRow[i].classList.remove("code");
            }
            //if not end of game, initialise the code
            else {
                codeRow[i].className += " " + code[i];
            }
        }
        // To avoid changing the text content at the end of this function (because game ends), return
        if (type === "endGame") {
            return;
        }

        gameControls.gameConsole.textContent = Status.opponentSubmittedCode;
    }
    
}

function ColourPicker(controls) {
    var colourPicker = this;
    this.controls = controls;
    this.submitButton = document.getElementsByTagName("button")[0];
    //the board itself
    this.board = (function() {
        let rows = document.getElementsByTagName("tbody")[1].rows;
        let b = [];
        for(let i = 0; i < 2; i++){
            for(let j = 0; j < 3; j++) {
                b.push(rows[i].getElementsByTagName("div")[j]);
            }
        }

        for(let i = 0; i < b.length; i++) {
            b[i].addEventListener("click", function() { colourPicker.renderChoice(b[i])});
        }
        return b;
    })();

    //{remember that this f is called ON the colourPicker object}
    //renders the colour choice based on the chosen colour
    this.renderChoice = function(picker) {
        //player is not allowed to choose colour
        if(this.controls.state !== "active") return;

        //determine the colour
        let colour = picker.classList[1];

        //update the cursor
        this.controls.cursor.classList.remove(this.controls.cursor.classList.item(1));
        //if it wasn't the cursor
        if(this.controls.cursor.classList.length === 1) {
            this.controls.cursor.className = this.controls.cursor.classList.item(0) + " " + colour;
        } else { //if it was the cursor
            this.controls.cursor.className = this.controls.cursor.classList.item(0) + " " + colour + " " + this.controls.cursor.classList.item(1);
        }
        //render the choice on the current peg
        this.controls.moveCursor(this.controls.cursorPos);
    };
}

function Peg(type) {
    this.type = type;

    //function to create peg element
    this.createPeg = function() {
        this.element = document.createElement('div');
        this.element.className = type + " empty";
        return this.element;
    }
}

// function to create timer
function setTimer() {
    var timer = document.getElementById("time-passed");
    //console.log(timer);
    intervals[timer.id] = setInterval(function(){
        let time = timer.innerHTML;
        let seconds = (parseInt(time.substring(time.length - 2)) + 1) % 60;     //get last 2 digits
        let minutes = parseInt(time.substring(0, time.length - 3));             //exclude .[seconds]

        if(seconds === 0) minutes++;
        timer.innerHTML = minutes + "." + (seconds < 10 ? "0" + seconds : seconds);
    }, 1000, timer);
}


function stopTimer() {
    let timer = document.getElementById("time-passed");
    clearInterval(intervals[timer.id]);
}

//0 - opponent, 2 - me
function initialiseTable(num){
    let tables = document.getElementsByTagName("tbody");
    let elementTable = tables[num];

    //creating a 2d array
    var table = Array.from(Array(10), () => new Array(8));

    //create table rows
    for(let i = 10; i > 0; i--) {
        let guess = elementTable.insertRow();
        guess.className =  "guess" + i;
        let attempt = guess.insertCell();
        let feedback = guess.insertCell();

        //empty pegs
        for(let j = 0; j < 4; j++) {
            let peg = new Peg("peg").createPeg();
            table[10-i][j] = peg;
            attempt.appendChild(peg);
        }
        //feedback pegs
        for(let j = 0; j < 4; j++) {
            let peg = new Peg("feedback").createPeg();
            table[10-i][4+j] = peg;
            feedback.appendChild(peg);
        }
        //appending a row
        elementTable.appendChild(guess);
    }
    return table;
}

function initialiseAudio() {
    var button = document.getElementsByTagName("button");
    var selector = document.getElementsByClassName("select");

    //audio
    var audioButton = new Audio('/../data/audio/submit.mp3');
    var audioSelector = new Audio('/../data/audio/click.mp3');

    //Add event listeners to selectors in colour picker
    for (let i = 0; i < selector.length; i++) {
        selector[i].addEventListener('click', playSelectorSound, false);
    }

    //Add event listeners to all buttons
    for (let i = 0; i < button.length; i++) {
        button[i].addEventListener('click', playButtonSound, false);
    }

    //play button sound
    function playButtonSound() {
        audioButton.play();
    }

    //play selector sound
    function playSelectorSound() {
        audioSelector.play();
    }
    //
    // //play win sound
    // function playWinSound() {
    //     audioWin.play();
    // }
    //
    // //play game over sound
    // function playGameOverSound() {
    //     audioGameOver.play();
    // }
}

(function setup() {
    //initialising boards for opponent and me and creating 2d arrays with references to the cells
    var oppTable = initialiseTable(0);
    var myTable = initialiseTable(2);

    //initialise audio
    initialiseAudio();

    //get the socket and initialise the game controls
    var socket = new WebSocket(Setup.WS_URL);
    var controls =  new GameControls(socket, myTable, oppTable);

    //sampleCode(controls.colourPicker) --> iterate over pegs in current rows and send the choice to the server
    document.getElementsByTagName("button")[0].addEventListener("click", function(){
        console.log("Submitted");
        if(controls.myCode != null) controls.submitGuess();
        else controls.submitCode();
    })

    //message from the server
    socket.onmessage = function (msg) {
        let message = JSON.parse(msg.data);
        console.log("[Message] " + JSON.stringify(message));

        //somebody has connected. If it is player A, tell him/her to wait until player B connects
        if (message.type == Messages.T_PLAYER_TYPE) {
            controls.setPlayerType(message.data); //should be "A" or "B"
            if(controls.getPlayerType() == "A") controls.gameConsole.textContent += "Wait for another player to connect";
        } //both players are connected. Tell them to choose the code
        else if (message.type == Messages.T_CHOOSE) {
            //allow player to choose the code
            controls.state = "active";
            controls.addEventListenersCurrentPos(0);
            controls.gameConsole.textContent = Status.choose;
        } //other player has made the guess
        else if (message.type == Messages.T_PLAYER_A_CODE || message.type == Messages.T_PLAYER_B_CODE) {
            controls.oppCode = message.data;
            controls.renderOpponentCode(message.data, "ongoing");
            //I have already sent and chosen the code - the game can be started
            //otherwise I need to choose the code
            if(controls.myCode != null) controls.startGame();
        } //this means I am player B and I will render the guess and feedback of player A
        else if(message.type == Messages.T_PLAYER_A_GUESS) {
            controls.renderOpponentGuess(message.data.guess, message.data.feedback);
            controls.startGuess();
        } //this means I am player A and I will render the guess and feedback of player B
        else if(message.type == Messages.T_PLAYER_B_GUESS) {
            controls.renderOpponentGuess(message.data.guess, message.data.feedback);
            controls.startGuess();
        } //the game has a winner - it can be finished
        else if(message.type == Messages.T_GAME_WON_BY) {
            controls.winner = message.data;
            controls.finishGame();
        }
    }

    /*socket.onopen = function () {
        socket.send("{}");
    };*/

    socket.onclose = function () {
        //the game is aborted by the other player
        if (controls.winner == null) {
            controls.state = "passive";
            controls.colourPicker.submitButton.disabled = true;
            //call renderOpponentCode with empty array of length 4 to reveal code
            controls.renderOpponentCode(["","","",""], "endGame");
            stopTimer();
            controls.gameConsole.innerHTML = Status.playAgain;
            alert(Status.aborted);
        }
      };
})();