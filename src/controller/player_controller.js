Twump.Controller.Player = Class.create()

Object.extend(Twump.Controller.Player.prototype, Twump.Controller.Common);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.PlaylistMixin);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.PlayerMixin);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.SerializationMixin);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.DiskOperationsMixin);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.LastFmMixin);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.ChildWindowsMixin);

Object.extend(Twump.Controller.Player.prototype, {
  initialize: function(options){
    this.initializing = true;
  
    Object.extend(this, options);
    
    this.subscribeToViewEvents(this.mainWindow, ["windowResized", "windowClosing", "lastFmTooltip"]);
    
    this.subscribeToViewEvents(this.playerWindow, [
      "previousClick", "nextClick", "pauseClick", "stopClick", "playClick", 
      "volumeChange", "setPlayPosition", 
      "openFolderClick", "loadListClick", "saveListClick", "shuffleClick", 
      "shuffleRemainingClick", "deleteClick", "clearClick",
      "editorClick", "drop", "filesDropped", "optionsClick"
    ]);
    
    this.subscribeToViewEvents(this.playlistWindow, [
      "pageChanged", "copyPathToClipboard", "itemSelected", "deleteClick"
    ]);
    
    this.player = new Twump.PlayerFacade();
    this.setPlaylist(new Twump.Model.Playlist())
    this.loadPlayerData();
    this.loadLastList();
    
    document.body.addEventListener('keydown', this.keyboardDispatcher.bind(this));
    this.progressStep = 0;
    
    this.initializing = false;
    setTimeout(this.savePlayerData.bind(this), 1000);
  },
  
  onWindowResized: function(){
    this.savePlayerData();
  },
  
  onWindowClosing: function(){
    this.closeAllChildWindows();
  },
  
  onOptionsClick: function(){
    this.openOrCloseChildWindow('options', {url: "options_window.html", 
      playerController: this
    });
  },
  
  onDrop: function(options){
    this.playlistWindow.onDragFinished();
    this[options.action](options);
  },
  
  keyboardDispatcher: function(event){ 
    var standardMap = {
      27: "stopClick", 32: "pauseClick", 33: "previousClick", 34: "nextClick", 13: "playClick",
      46: "deleteClick", 38: "volumeUp", 40: "volumeDown", 39: "moveForward", 37: "moveBackward"
    };
    
    var ctrlMap = {
      69: "editorClick", 79: "loadListClick", 83: "saveListClick", 79: "optionsClick"
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
