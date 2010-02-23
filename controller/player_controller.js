Twump.Controller.Player = Class.create()

Object.extend(Twump.Controller.Player.prototype, Twump.Controller.Common);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.PlaylistMixin);
Object.extend(Twump.Controller.Player.prototype, Twump.Controller.PlayerMixin);

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
    this.setPlaylist([])
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
  
  lastFmSetup: function(){
    var lastFmLoginData = null;
    
    if(confirm('last.fm?')){
      var login = Twump.Api.readEncrypted('lastFmLogin'), password = Twump.Api.readEncrypted('lastFmPassword');
      if (!login)
        lastFmLoginData = this.lastFmLogin();
      else {
        if (confirm(login + '?'))
          lastFmLoginData = {login: login, password: password};
        else
          lastFmLoginData = this.lastFmLogin();
      }
      
      if (lastFmLoginData) {
        Twump.Api.writeEncrypted('lastFmLogin', lastFmLoginData.login);
        Twump.Api.writeEncrypted('lastFmPassword', lastFmLoginData.password);
      }
    }
    
    this.lastFm = new LastFm(lastFmLoginData);
  },
  
  lastFmLogin: function(){
    var login = prompt('login');
    if (!login) return null;
    
    var password = prompt('password');
    if (!password) return null;
    
    return {login: login, password: password}
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
