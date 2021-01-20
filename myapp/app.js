//@ts-check

//importing modules and doing other preparation
var express = require("express");
var app = express();

//set up the views directory - the directory containing all templates
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

//modules for server setup
var http = require("http");
var port = process.argv[2];
var websocket = require("ws");
var server = http.createServer(app);
const wss = new websocket.Server({ server });

//important modules for the game
var messages = require("./public/javascripts/messages");
var gameStats = require("./stats");
var Game = require("./game");

//routing
require("./routes/index.js")(app);

app.get("/", (req, res) => {
  res.render("splash.ejs", {
    getGamesNow: gameStats.getGamesNow(),
    getGamesInTotal: gameStats.getGamesInTotal() - 1,
    getAvgNumGuesses: gameStats.getAvgNumGuesses()
  });
});

//object to store websockets and their games (like a dictionary/map)
//property: websocket, value: game
var websockets = {}; 


// cleaning up the websockets object regularly (every minute) if the game is completed or aborted (not in process)
setInterval(function() {
  //for every websocket object in the websockets dictionary
  for (let i in websockets) {
    //Use Object.prototype.hasOwnProperty.call(objRef, 'propName') to guard the TypeError when objRef has null prototype.
    //  So, does the websockets dictionary have websocket i as a property?
    if (Object.prototype.hasOwnProperty.call(websockets,i)) {
      //get the game the current websocket plays/played
      let game = websockets[i];
      //if the game is finished/aborted, delete websocket
      if (game.playerA == null && game.playerB == null) {
        console.log("[SERVER] Deleted game with id " + game.id);
        delete websockets[i];
      }
    }
  }
}, 60000);

//current game object
var currentGame = new Game(gameStats.getGamesInTotal());
gameStats.incGamesInTotal();
var connectionID = 0; //each websocket receives a unique ID

wss.on("connection", function connection(ws) {
  //initialise the player
  let con = ws;
  con.id = connectionID++;
  let playerType = currentGame.addPlayer(con);
  websockets[con.id] = currentGame;

  console.log(`[SERVER] Player with ID ${con.id} has been placed in game with ID ${currentGame.id} as Player ${playerType}`);

  //inform the client about its player type
  let msg = messages.O_PLAYER_TYPE;
  msg.data = playerType == "A" ? "A" : "B";
  con.send(JSON.stringify(msg));
  
  //once we have two players, a new game object is created; now if a player leaves, the game is aborted.
  //  no more players can connect to this game
  if (currentGame.gameState() == "both") {
    //inform both players that they can choose the code
    currentGame.playerA.send(messages.S_CHOOSE);
    currentGame.playerB.send(messages.S_CHOOSE);

    //create a new game so that no more players will be added to current game
    gameStats.incGamesNow();  //the game has started
    currentGame = new Game(gameStats.getGamesInTotal());
    gameStats.incGamesInTotal();
  }

  //a message is coming
  con.on("message", function (msg) {
    let message = JSON.parse(msg);

    //determine the game object and player type
    let gameObj = websockets[con.id];
    let player = gameObj.playerA == con ? "A" : "B";

    console.log("[PLAYER " + player + "] " + msg);

    //player A or B reported that the game has a winner
    if(message.type == messages.T_GAME_WON_BY) {
      gameObj.setWinner(message.data);
      //notify players
      gameObj.playerA.send(JSON.stringify(message));
      gameObj.playerB.send(JSON.stringify(message));

      let guesses = 10;
      if(gameObj.winner === "A") {
        gameObj.playerAGuesses++;
        guesses = gameObj.playerAGuesses;
      } else {
        gameObj.playerBGuesses++;
        guesses = gameObj.playerBGuesses;
      }

      gameStats.updateAvgGuesses(guesses);
      console.log("[SERVER] Player " + message.data + " has won the game. Game finished");
      //decrement games now
      gameStats.decGamesNow(); //the game will be cleared from websockets dictionary after some time

    } //a normal message from player A
    else if(player === "A") {
      //if player A has chosen the code, set it and send to player B
      if(message.type == messages.T_PLAYER_A_CODE) {
        gameObj.setCode(message.data, "A");
        console.log("[SERVER] Player A code: " + message.data);
        gameObj.playerB.send(JSON.stringify(message));
      } //if player A has made a guess, send the guess and feedback to player B
      else if(message.type == messages.T_PLAYER_A_GUESS) {
        gameObj.playerB.send(JSON.stringify(message));
        gameObj.playerAGuesses++;
        console.log("[SERVER] Player A guesses: " + gameObj.playerAGuesses);
      }
    } //a normal message from player B
    else {
      //if player B has chosen the code, set it and send to player A
      if(message.type == messages.T_PLAYER_B_CODE) {
        gameObj.setCode(message.data, "B");
        console.log("[SERVER] Player B code: " + message.data);
        gameObj.playerA.send(JSON.stringify(message));
      }
       //if player B has made a guess, send the guess and feedback to player A
       else if(message.type == messages.T_PLAYER_B_GUESS) {
        gameObj.playerA.send(JSON.stringify(message));
        gameObj.playerBGuesses++;
        console.log("[SERVER] Player B guesses: " + gameObj.playerBGuesses);
      }
    }
  });

  //somebody has exited
  con.on("close", function(code) {
    //code 1001 means almost always closing initiated by the client
    console.log("[SERVER] Player with ID " + con.id + " disconnected ...");

    if(code == 1001) {
      //abort the game if possible; otherwise the game is already completed
      let gameObj = websockets[con.id];

      if(!gameObj.isFinished())  {
        gameObj.abort();
        gameStats.decGamesNow();
      }
      //update stats???
      
      //determine whose connection remains open and close it
      try {
        gameObj.playerA.close();
        gameObj.playerA = null;
        console.log("[SERVER] disconnected player A from game with ID " + gameObj.id);
      } catch (e) {
        console.log("Player A closing: " + e);
      }

      try {
        gameObj.playerB.close();
        gameObj.playerB = null;
        console.log("[SERVER] disconnected player B from game with ID " + gameObj.id);
      } catch (e) {
        console.log("Player B closing: " + e);
      }
    }
  });
});

server.listen(port);
console.log("[SERVER] Hey, Server here");
