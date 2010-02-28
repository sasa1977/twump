Twump.Controller.Player = Class.create()

Object.extend(Twump.Controller.Player.prototype, Twump.Controller.Common);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.PlaylistMixin);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.PlayerMixin);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.SerializationMixin);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.LastFmMixin);

Object.extend(Twump.Controller.Player.prototype, {
  initialize: function(options){
    Object.extend(this, options);
    
    this.lastFmSetup();
    
    this.subscribeToViewEvents(this.playerWindow, 
      [
        "windowClosing", "previousClick", "nextClick", "pauseClick", "stopClick", "playClick", 
        "volumeChange", "setPlayPosition", 
        "openFolderClick", "addFolderClick", "shuffleClick", "shuffleRemainingClick", "deleteClick", "clearClick",
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
  
  onItemSelected: function(id){
    this.play(this.playlist.idToIndex(id))
  },
  
  onCopyPathToClipboard: function(fileId){
    Twump.Api.copyTextToClipboard(this.playlist.file(fileId).path);
  },
  
  onScrollChanged: function(info){
    info.ids.each(function(id){
      var file = this.playlist.file(id);
      if (file && !file.loadingMetadata) {
        this.loadMetadata(file);
        file.loadingMetadata = true;
      }
    }.bind(this))
  },
  
  onWindowClosing: function(){
    this.closeEditor();
  },
  
  onDrop: function(options){
    this[options.action](options);
  }
})
