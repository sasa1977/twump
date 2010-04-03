Twump.Application = Class.define({
  initialize: function(){
    var playerWindow = new Twump.View.PlayerWindow();
    var playlistWindow = new Twump.View.PlaylistWindow();
    var mainWindow = new Twump.View.MainWindow({playerWindow: playerWindow, playlistWindow: playlistWindow})
  
    this.controller = new Twump.Controller.Player({
      mainWindow: mainWindow,
      playerWindow: playerWindow, 
      playlistWindow: playlistWindow,
      logger: Twump.Api.Logger
    });
  }
});
