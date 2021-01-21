module.exports = function(app) {
  app.get("/play", function(req, res) {
    res.sendFile("game.html", { root : "./public"});
  });

  app.get("/rules", function(req, res) {
    res.sendFile("rules.html", { root : "./public"});
  });
}
