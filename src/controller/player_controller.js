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
    
    this.subscribeToViewEvents(this.mainWindow, ["resized"]);
    
    this.subscribeToViewEvents(this.playerWindow, [
      "windowClosing", "previousClick", "nextClick", "pauseClick", "stopClick", "playClick", 
      "volumeChange", "setPlayPosition", 
      "openFolderClick", "addFolderClick", "loadListClick", "saveListClick", "shuffleClick", 
      "shuffleRemainingClick", "deleteClick", "clearClick",
      "editorClick", "drop", "filesDropped"
    ]);
    
    this.subscribeToViewEvents(this.playlistWindow, [
      "pageChanged", "copyPathToClipboard", "itemSelected", "deleteClick"
    ])
    
    this.player = new Twump.PlayerFacade();
    this.setPlaylist(new Twump.Model.Playlist())
    this.loadPlayerData();
    this.loadLastList();
    
    document.body.addEventListener('keydown', this.keyboardDispatcher.bind(this));
    this.progressStep = 0;
  },
  
  onWindowClosing: function(){
    this.closeEditor();
  },
  
  onDrop: function(options){
    this[options.action](options);
  },
  
  keyboardDispatcher: function(event){ 
    var standardMap = {
      27: "stopClick", 32: "pauseClick", 33: "previousClick", 34: "nextClick", 13: "playClick",
      46: "deleteClick", 38: "volumeUp", 40: "volumeDown", 39: "moveForward", 37: "moveBackward"
    };
    
    var ctrlMap = {
      69: "editorClick", 79: "loadListClick", 83: "saveListClick"
    };
    
    var altMap = {
      83: 'shuffleClick', 65: 'shuffleRemainingClick'
    }
  
    var relevantMap = null;
    
    if (!event.ctrlKey && !event.altKey && !event.shiftKey)
      relevantMap = standardMap;
    else if (event.ctrlKey) relevantMap = ctrlMap;
    else if (event.altKey) relevantMap = altMap;
  
    if (!relevantMap)  return;
    
    var method = this["on" + (relevantMap[event.keyCode] || "").capitalizeEachWord()];
    if (method) {
      method.bind(this)();
      return false;
    }
  }
})
