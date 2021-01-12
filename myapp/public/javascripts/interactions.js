//@ts-check

//let music = new Audio("../data/audio/eminem.mp3");

function GameControls(socket, myTable, opponentTable) {
    this.playerType = null;
    this.MAX_GUESSES = 12;
    this.numGuesses = 0; //+1
    this.opponentTable = opponentTable;
    this.myTable = myTable;
    this.colourPicker = new ColourPicker();
    this.winner = null;  // "B" or "A"
    //collectCode
    this.code = this.colourPicker.collectCode();

    //some functions
    this.getPlayerType = function() { return this.playerType; }

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
    
}

//server check the guess. He sends back the feedback or the winner 
//black : 1
//white : 2
//winner : null or A or B


function ColourPicker() {
    this.collectCode = function() {
        return 42;
    }
}

//let opponentTable = document.querySelector(".opponenttable");

//kinda class Peg
function Peg(type, size) {
    this.type = type;
    this.size = size;

    this.createPeg = function() {
        this.element = document.createElement('div');
        this.element.className = "peg " + type;
        this.element.textContent = size;
        console.log(this);
        return this.element;
    }
}

function setTimer() {

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
            let peg = new Peg("empty", "O").createPeg();
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
    /*for(let i = 0; i < 12; i++) {
        for(let j = 0; j < 8; j++) {
            console.log(oppTable[i][j]);
        }
    }*/
    //console.log(Status["intro"]);
    
})();