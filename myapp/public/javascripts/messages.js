(function(exports) {
  /*
   * 1.-2. Server to client: set player type as A or B
   */
  exports.T_PLAYER_TYPE = "PLAYER-TYPE";
  exports.O_PLAYER_TYPE = {
    type: exports.T_PLAYER_TYPE,
    data: null    //will be either A or B
  };

  /*
   * 3. Server to client (to both players): choose code
   */
  exports.T_CHOOSE = "CHOOSE-CODE";
  exports.O_CHOOSE = { type: exports.T_CHOOSE };
  exports.S_CHOOSE = JSON.stringify(exports.O_CHOOSE);

  /*
   * 4. Client to server: player A has chosen the code
   * 5. Server to client: send to player B
   */
  exports.T_PLAYER_A_CODE = "PLAYER-A-CODE";
  exports.O_PLAYER_A_CODE = {
    type: exports.T_PLAYER_A_CODE,
    data: null //will be an array of 4 strings
  };

  /*
   * 6. Client to server: player B has chosen the code
   * 7. Server to client: send to player A
   */
  exports.T_PLAYER_B_CODE = "PLAYER-B-CODE";
  exports.O_PLAYER_B_CODE = {
    type: exports.T_PLAYER_B_CODE,
    data: null
  };
  

  /*
   * 8. Client to server: Player A has made a guess
   * 9. Server to client: Send guess and feedback to player B to be rendered
   */
  exports.T_PLAYER_A_GUESS = "PLAYER_A_GUESS";
  exports.O_PLAYER_A_GUESS = {
    type: exports.T_PLAYER_A_GUESS,
    data: { guess: null, feedback: null } //will be set accordingly
  };

   /*
   * 10. Client to server: Player B has made a guess
   * 11. Server to client: Send guess and feedback to player A to be rendered
   */
  exports.T_PLAYER_B_GUESS = "PLAYER_B_GUESS";
  exports.O_PLAYER_B_GUESS = {
    type: exports.T_PLAYER_B_GUESS,
    data: { guess: null, feedback: null } //will be set accordingly
  };

  /* Game flow continues according to the scheme above

  /*
   * Client to server: game is complete; message sent by the absolute winner, or player A if (s)he guesses the last time incorrectly
   */
  exports.T_GAME_WON_BY = "GAME-WON-BY";
  exports.O_GAME_WON_BY = {
    type: exports.T_GAME_WON_BY,
    data: null   // will be a or B
  };

})(typeof exports === "undefined" ? (this.Messages = {}) : exports);
//if exports is undefined - we are in the browser, so we create an object. Otherwise we are on the server side and return exports object itself