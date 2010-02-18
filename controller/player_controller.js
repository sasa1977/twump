Twump.Controller.Player = Class.create()

Object.extend(Twump.Controller.Player.prototype, Twump.Controller.Common);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.PlaylistMixin);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.PlayerMixin);

Object.extend(Twump.Controller.Player.prototype, {
  initialize: function(options){
    Object.extend(this, options);
    
    this.subscribeToViewEvents(this.playerWindow, 
      [
        "windowClosing", "previous", "next", "pause", "stop", "play", "volumeChange", "setPlayPosition",
        "openFolder", "addFolder", "shuffle", "shuffleRemaining", "delete", "clear","editor", "drop"
      ]
    )
    
    this.player = new Twump.PlayerFacade();
    this.setPlaylist([])
    this.loadPlayerData();
    this.loadLastList();
  },
  
  onWindowClosing: function(){
    this.closeEditor();
  },
  
  onDrop: function(options){
    this[options.action](options);
  }
})
