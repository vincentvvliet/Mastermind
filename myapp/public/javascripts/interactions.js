//@ts-check

//let music = new Audio("../data/audio/eminem.mp3");
var intervals = {};

function GameControls(socket, myTable, opponentTable) {
    this.playerType = null;
    var gameControls = this;
    this.state = "active";
    this.MAX_GUESSES = 12;
    this.numGuesses = 0; //+1
    this.opponentTable = opponentTable;
    this.myTable = myTable;
    this.colourPicker = new ColourPicker(this);
    this.winner = null;  // "B" or "A"
    //collectCode
    //this.code = null;
    this.currentGuess = (function() {
        let t = document.getElementsByTagName("thead")[2].rows.item(1).cells[0].getElementsByTagName("div");
        return t;
    })();
    
    this.cursorPos = 0;    //should be in [0,3]
    this.cursor = this.currentGuess[this.cursorPos];
    //console.log(this.currentGuess);
    //console.log(this.cursor);

    //some functions
    this.getPlayerType = function() { return this.playerType; }

    this.addEventListenersCurrentPos = function(pos) {
        this.currentGuess[pos].addEventListener("click", function() {
            gameControls.cursorPos = pos;
            gameControls.cursor = gameControls.currentGuess[gameControls.cursorPos];
         });
    }
    
    this.removeEventListenersFromCurrentRow = function() {
        for(let i = 0; i < 4; i++) {
            let el = gameControls.currentGuess[i];
            let elClone = el.cloneNode(true);
            el.parentNode.replaceChild(elClone, el);
        }
    }

    this.incrementGuessesMade = function() {
        this.numGuesses++;
        
        //game is still on
        if(this.whoWon() == null) {
            //do sth
        }
    }

    this.whoWon = function() {

        if(this.numGuesses > this.MAX_GUESSES) {
            if(this.playerType === "B") {
                //a tie
            }
        }
        return 42;
    }

    this.revealOpponentCode = function() {

    }

    this.updateFeedback = function(whites, blacks) {

    }

    this.updateGame = function() {

    }

    //pos is either controls.pos or (selectedPos - 1)
    this.moveCursor = (pos) => {
        if(this.state !== "active") return;
        //if position is valid
        console.log(this.cursorPos);
        if(this.cursorPos === 3) this.colourPicker.submitButton.disabled = false;
        if(pos < 3) {
            this.cursorPos = pos + 1;
            this.cursor = this.currentGuess[this.cursorPos];
            this.addEventListenersCurrentPos(this.cursorPos);
           // console.log(this);
        }
    };

    this.submitGuess = function() {
        let choice = [];
        for(let i = 0; i < 4; i++) choice.push(gameControls.currentGuess[i].className.substring(4));
        //send jason to the sever
        console.log(choice);
    
        gameControls.removeEventListenersFromCurrentRow();
        //check the guess numba
        if(gameControls.numGuesses === gameControls.MAX_GUESSES) {
            //some logic
            gameControls.state = "passive";
            gameControls.colourPicker.submitButton.disabled = true;
            gameControls.numGuesses++;
            stopTimer();
            document.getElementsByTagName("thead")[0].rows[0].hidden = false;
            alert("Game over");
            console.log(gameControls.numGuesses);
            return;
        }
        //update the row
        gameControls.currentGuess = gameControls.opponentTable[gameControls.MAX_GUESSES - 1 - gameControls.numGuesses];
        //update the cursor
        gameControls.cursorPos = 0;
        gameControls.cursor = gameControls.currentGuess[0];

        gameControls.numGuesses++;
        gameControls.colourPicker.submitButton.disabled = true;
        gameControls.state = "passive";
    };

    this.startGuess = function() {
        gameControls.state = "active";
        gameControls.addEventListenersCurrentPos(0);
    }
    
}

//server check the guess. He sends back the feedback or the winner 
//black : 1
//white : 2
//winner : null or A or B

//kinda class ColourPicker
function ColourPicker(controls) {
    var colourPicker = this;
    this.controls = controls;
    this.submitButton = document.getElementsByTagName("button")[0];
    this.board = (function() { //controls
        let rows = document.getElementsByTagName("tbody")[1].rows;
        let b = [];
        for(let i = 0; i < 2; i++){
            for(let j = 0; j < 3; j++) {
                b.push(rows[i].getElementsByTagName("div")[j]);
                //console.log(b[b.length-1]);
            }
        }

        for(let i = 0; i < b.length; i++) {
            b[i].addEventListener("click", function() { colourPicker.renderChoice(b[i])});
        }
        return b;
    })();

    //remember that this f is called ON the colourPicker object
    this.renderChoice = function(picker) {
        //determine colour
        if(this.controls.state !== "active") return;
        let colour = picker.className.substring(7);
        //update class
        this.controls.cursor.classList.remove(this.controls.cursor.classList.item(1));
        this.controls.cursor.className += " " + colour;
        //render the choice on the current peg
        this.controls.cursor.textContent = colour.substring(0,1).toUpperCase();
        this.controls.moveCursor(this.controls.cursorPos);
    };

    //picker is a div
    
    //add eventlisteners to the pickers
    this.collectCode = function() {
        return 42;
    };
}


//kinda class Peg
function Peg(type, size) {
    this.type = type;
    this.size = size;

    this.createPeg = function() {
        this.element = document.createElement('div');
        this.element.className = type + " empty";
        this.element.textContent = size;
        //console.log(this);
        return this.element;
    }
}

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


function initialiseTable(num){
    let tables = document.getElementsByTagName("tbody");
    let elementTable = tables[num];

    //creating a 2d array
    var table = Array.from(Array(12), () => new Array(8));

    for(let i = 12; i > 0; i--) {
        let guess = elementTable.insertRow();
        guess.className =  "guess" + i;
        let attempt = guess.insertCell();
        let feedback = guess.insertCell();

        //empty pegs
        for(let j = 0; j < 4; j++) {
            let peg = new Peg("peg", "O").createPeg();
            table[12-i][j] = peg;
            attempt.appendChild(peg);
        }
        //feedback pegs
        for(let j = 0; j < 4; j++) {
            let peg = new Peg("feedback", "o").createPeg();
            table[12-i][4+j] = peg;
            feedback.appendChild(peg);
        }
        //appending a row
        elementTable.appendChild(guess);
        //oppTable[12-i];
    }
    return table;
}

(function setup() {
    //initialising boards for opponent and me and creating 2d arrays with references to the cells
    var oppTable = initialiseTable(0);
    var myTable = initialiseTable(2);
    setTimer();
    var controls = new GameControls(null, myTable, oppTable);
    controls.addEventListenersCurrentPos(0);


    //sampleCode(controls.colourPicker) --> iterate over pegs in current rows and send the choice to the server
    document.getElementsByTagName("button")[0].addEventListener("click", function(){
        console.log("Submitted");
        controls.submitGuess();
        //console.log(controls.cursor);
    })

    //onmessage ...
    document.getElementsByTagName("h1")[0].addEventListener("click", function(){
        controls.startGuess();
    })

    //when the game is over, break the server: no interactivity except for the PLAY AGAIN button
    
})();
