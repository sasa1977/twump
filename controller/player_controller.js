Twump.Controller.Player = Class.create()

Object.extend(Twump.Controller.Player.prototype, Twump.Controller.Common);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.PlaylistMixin);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.PlayerMixin);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.SerializationMixin);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.DiskOperationsMixin);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.LastFmMixin);

Object.extend(Twump.Controller.Player.prototype, {
  initialize: function(options){
    Object.extend(this, options);
    
    this.lastFmSetup();
    
    this.subscribeToViewEvents(this.playerWindow, 
      [
        "windowClosing", "previousClick", "nextClick", "pauseClick", "stopClick", "playClick", 
        "volumeChange", "setPlayPosition", 
        "openFolderClick", "addFolderClick", "loadListClick", "saveListClick", "shuffleClick", "shuffleRemainingClick", "deleteClick", "clearClick",
        "editorClick", "drop", "filesDropped"
      ]
    );
    
    this.subscribeToViewEvents(this.playlistWindow, ["scrollChanged", "copyPathToClipboard", "itemSelected"])
    
    this.player = new Twump.PlayerFacade();
    this.setPlaylist(new Twump.Model.Playlist())
    this.loadPlayerData();
    this.loadLastList();

    this.progressStep = 0;
  },
  
  onWindowClosing: function(){
    this.closeEditor();
  },
  
  onDrop: function(options){
    this[options.action](options);
  }
})
