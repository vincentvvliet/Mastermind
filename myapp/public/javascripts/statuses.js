//@ts-check

var Status = {
    //alerted
    won : "<p>Congratulations! You won the game!</p>",
    //alerted
    lost : "<p>Sorry, but you have lost this game :(</p>",
    //rendered in the "console"
    playAgain : `<form action="/play" method="get" align="center"><button type="submit">PLAY AGAIN!</button></form>`,
    //rendered in the "console"
    choose : "Choose your code by clicking on the colour picker",
    //rendered in the "console"
    playerAIntro : "Now you have to guess opponent's code quicker (max 10 guesses, you lose if you miss the last guess). Your turn now",
    //rendered in the "console"
    playerBIntro : "Now you have to guess opponent's code quicker (you win if the opponent misses the last guess). Opponent's turn now",
    //rendered in the "console"
    opponentSubmittedCode: "Your opponent has chosen the code",
    //rendered in the "console"
    iSubmittedCode: "Wait for the opponent to submit the code",
    //rendered in the "console"
    opponent : "Your opponent has made a guess. It's your turn now",
    //rendered in the "console"
    continuePlaying : "Your guess is incorrect. Wait for the opponent and try again!",
    //rendered in the "console"
    aborted: "Your opponent is no longer available. Game aborted."
}