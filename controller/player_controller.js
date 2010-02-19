Twump.Controller.Player = Class.create()

Object.extend(Twump.Controller.Player.prototype, Twump.Controller.Common);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.PlaylistMixin);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.PlayerMixin);

Object.extend(Twump.Controller.Player.prototype, {
  initialize: function(options){
    Object.extend(this, options);
    
    this.subscribeToViewEvents(this.playerWindow, 
      [
        "windowClosing", "previousClick", "nextClick", "pauseClick", "stopClick", "playClick", 
        "volumeChange", "setPlayPosition", 
        "openFolderClick", "addFolderClick", "shuffleClick", "shuffleRemainingClick", "deleteClick", "clearClick",
        "editorClick", "drop"
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
