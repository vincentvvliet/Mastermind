/* 
 In-memory game statistics "tracker".
*/

var gameStats = (function() {
  var since = Date.now(); /* when the object was created */
  var gamesInTotal = 0; /* number of games than have been initialized in total */
  var gamesFinished = 0; /* number of games completed */
  var gamesNow = 0; /* number of games being played now */
  var averageGuesses = 0; /* number of guesses to complete the game */
  var sumOfGuesses = 0;

  return {
    incGamesInTotal : function() { gamesInTotal++; },
    getGamesInTotal : function() { return gamesInTotal; },
    updateGamesFinished : function() { gamesFinished++; },
    getGamesFinished : function() { return gamesFinished; },
    incGamesNow : function() { gamesNow++; },
    decGamesNow : function() { gamesNow--; },
    getGamesNow : function() { return gamesNow; },
    updateSumOfGuesses: function(guess) { sumOfGuesses += guess; },
    updateAvgGuesses : function(guess) { averageGuesses = (sumOfGuesses + guess) / gamesFinished; },
    getAvgNumGuesses : function() { return averageGuesses.toFixed(2); }
  }
})();

module.exports = gameStats;