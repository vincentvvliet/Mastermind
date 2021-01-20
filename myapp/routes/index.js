module.exports = function(app) {
  // app.get("/", function(req, res) {
  //   res.sendFile("splash.html", { root : "./public"});
  // });

  //move rendering ejs here


  app.get("/play", function(req, res) {
    res.sendFile("game.html", { root : "./public"});
  });

  app.get("/options", function(req, res) {
    res.sendFile("options.html", { root : "./public"});
  });

  app.get("/rules", function(req, res) {
    res.sendFile("rules.html", { root : "./public"});
  });
}
