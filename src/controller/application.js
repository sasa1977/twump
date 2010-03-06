Twump.Application = Class.create();
Twump.Application.prototype = {
  initialize: function(){
    this.playerWindow = new Twump.View.PlayerWindow();
    this.playlistWindow = new Twump.View.PlaylistWindow();
    this.logger = Twump.Api.Logger;
    
    this.controller = new Twump.Controller.Player({
      playerWindow: this.playerWindow, playlistWindow: this.playlistWindow,
      logger: this.logger
    });
  }
};
