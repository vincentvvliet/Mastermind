/* 
 In-memory game statistics "tracker".
*/

var gameStats = (function() {
  var since = Date.now(); /* when the object was created */
  var gamesInTotal = 0; /* number of games than have been initialized in total */
  var gamesFinished = 0; /* number of games completed */
  var gamesNow = 0; /* number of games being played now */
  var sumOfGuesses = 0; /* used to keep track of average number of guesses */
  var avgGuesses = 0; /* current average guess number */

  return {
    incGamesInTotal : function() { gamesInTotal++; },
    getGamesInTotal : function() { return gamesInTotal; },
    updateGamesFinished : function() { gamesFinished++; },
    getGamesFinished : function() { return gamesFinished; },
    incGamesNow : function() { gamesNow++; },
    decGamesNow : function() { gamesNow--; },
    getGamesNow : function() { return gamesNow; },
    updateAvgGuesses : function(guess) {
      sumOfGuesses += guess;
      avgGuesses = sumOfGuesses / gamesFinished; },
    getAvgNumGuesses : function() { return avgGuesses.toFixed(1); }
  }
})();

module.exports = gameStats;