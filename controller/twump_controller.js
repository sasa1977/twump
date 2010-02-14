Twump.Controller = Class.create()
Twump.Controller.prototype = {
  initialize: function(playerWindow){
    this.playerWindow = playerWindow;
    this.player = new Twump.PlayerFacade();
    this.openFolder();
  },
  
  openFolder: function(){
    var file = new air.File(); 
    file.addEventListener(air.Event.SELECT, this.dirSelected.bind(this)); 
    file.browseForDirectory('Select folder');
  },
  
  dirSelected: function(event){
    this.setPlaylist(air.File.getFilesRecursive(event.target.nativePath));
    this.playCurrent();
  },
  
  setPlaylist: function(list){
    this.current = 0;
    this.list = list;
  },
  
  playCurrent: function(){
    if (this.list){
      this.player.play(this.currentFile(), {
        onPlayProgress: this.playerWindow.displayPlayProgress.bind(this.playerWindow)
      });
    }
  },
  
  currentFile: function(){
    if (!this.list) return null;
    return this.list[this.currentIndex()]     
  },
  
  currentIndex: function(){
    return this.current || 0;
  }
}
