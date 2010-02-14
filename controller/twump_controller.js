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
    this.setCurrentIndex(0);
    this.list = list;
  },
  
  playCurrent: function(){
    if (!this.list) return;
    
    this.player.play(this.currentFile(), {
      onPlayProgress: this.onPlayProgress.bind(this),
      onPlaybackComplete: this.onPlaybackComplete.bind(this)
    });
  },
  
  onPlayProgress: function(data){
    this.playerWindow.displayPlayProgress(Object.extend(data, {file: this.currentFile()}));
  },
  
  onPlaybackComplete: function(){
    this.playNext();
  },
  
  currentFile: function(){
    if (!this.list) return null;
    return this.list[this.currentIndex()]     
  },
  
  currentIndex: function(){
    return this.current || 0;
  },
  
  setCurrentIndex: function(index){
    this.current = index;  
  },
   
  stop: function(){
    this.player.stop();
  },
  
  playNext: function(){
    if (!this.list || this.currentIndex() + 1 >= this.list.length) return;
    this.stop();
    this.setCurrentIndex(this.currentIndex() + 1);
    this.playCurrent();
  }
}
