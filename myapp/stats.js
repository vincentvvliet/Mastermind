/* 
 In-memory game statistics "tracker".
*/

var gameStats = (function() {
  var since = Date.now(); /* when the object was created */
  var gamesInTotal = 0; /* number of games than have been initialized in total */
  var gamesNow = 0; /* number of games being played now */
  var averageGuesses = 0; /* number of guesses to complete the game */

  return {
    incGamesInTotal : function() { gamesInTotal++; },
    getGamesInTotal : function() { return gamesInTotal; },
    incGamesNow : function() { gamesNow++; },
    decGamesNow : function() { gamesNow--; },
    getGamesNow : function() { return gamesNow; },
    updateAvgGuesses : function(guess) { averageGuesses = (averageGuesses + guess) / gamesInTotal; },
    getAvgNumGuesses : function() { return averageGuesses; }
  }
})();

module.exports = gameStats;