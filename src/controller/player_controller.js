Twump.Controller.Player = Class.define(
  Twump.Controller.Common,
  Twump.Controller.PlaylistMixin,
  Twump.Controller.PlayerMixin,
  Twump.Controller.SerializationMixin,
  Twump.Controller.DiskOperationsMixin,
  Twump.Controller.LastFmMixin,
  Twump.Controller.ChildWindowsMixin,

  {
    initialize: function(options){
      this.initializing = true;
  
      Object.extend(this, options);
    
      this.subscribeToViewEvents(this.mainWindow, [
        "windowResized", "windowClosing", "lastFmTooltip", "lastFmStatusClick"
      ]);
    
      this.subscribeToViewEvents(this.playerWindow, [
        "previousClick", "nextClick", "pauseClick", "stopClick", "playClick", 
        "volumeChange", "setPlayPosition", 
        "addFolderAtEnd", "addFolderAfterCurrent",
        "loadListClick", "saveListClick", "shuffleClick", 
        "shuffleRemainingClick", "removeSelected", "removeNonExisting", "removeDuplicate", "clearClick",
        "editorClick", "drop", "filesDropped", "optionsClick",
        "repeatMode", "showCurrentClick"
      ]);
    
      this.subscribeToViewEvents(this.playlistWindow, [
        "pageChanged", "copyPathToClipboard", "itemSelected", "removeSelected", "setRepeatPattern", 
        "shuffleSelection"
      ]);
    
      this.player = new Twump.PlayerFacade();
      this.setPlaylist(new Twump.Model.Playlist())
      this.loadPlayerData();
      this.loadLastList();
    
      document.body.addEventListener('keydown', this.keyboardDispatcher.bind(this));
      this.progressStep = 0;
    
      this.initializing = false;
      setTimeout(this.savePlayerData.bind(this), 1000);
      window.nativeWindow.activate();
    },
  
    onWindowResized: function(){
      this.savePlayerData();
    },
  
    onWindowClosing: function(){
      this.closeAllChildWindows();
    },
  
    onOptionsClick: function(){
      this.openOrCloseChildWindow('options', {url: "../options/options_window.html", 
        playerController: this
      });
    },
  
    onDrop: function(options){
      this.playlistWindow.onDragFinished();
      this[options.action](options);
    },
  
  convertMap: function(map){
    return Object.keys(map).inject({}, function(memo, key){
      var newKey = null;

      if (key.length == 1)
        newKey = key.toUpperCase().charCodeAt(0);
      else
        newKey = Event["KEY_" + key]
        
      if (newKey)
        memo[newKey] = map[key];
      return memo;
    })
  },
  
  keyboardDispatcher: function(event){
    Event.stop(event)
    
    var standardMap = this.convertMap({
        ESC: "stopClick", SPACE: "pauseClick", PAGEUP: "previousClick", PAGEDOWN: "nextClick", RETURN: "playClick",
        DELETE: "deleteClick", UP: "volumeUp", DOWN: "volumeDown", RIGHT: "moveForward", LEFT: "moveBackward",

        'e': "editorClick", 'l': "loadListClick", 's': "saveListClick", 'o': "optionsClick"
    });
    
    var shiftMap = this.convertMap({
      's': "shuffleClick", 'r': "shuffleRemainingClick"
    })
    
    // currently air 2 beta doesn't provide good keyCodes when ctrl or alt is pressed
    // so I don't use these for hotkeys
    var ctrlMap = {};
    var altMap = {};
      
    var relevantMap = null;
    
    if (!event.ctrlKey && !event.altKey && !event.shiftKey)
      relevantMap = standardMap;
    else if (event.ctrlKey) relevantMap = ctrlMap;
    else if (event.altKey) relevantMap = altMap;
    else if (event.shiftKey) relevantMap = shiftMap;
  
      if (!relevantMap)  return;
    
      var method = this["on" + (relevantMap[event.keyCode] || "").capitalizeEachWord()];
      if (method) {
        method.bind(this)();
        return false;
      }
    }
  }
);
