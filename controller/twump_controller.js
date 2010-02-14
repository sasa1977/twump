Twump.Controller = Class.create()
Twump.Controller.prototype = {
  initialize: function(playerWindow, storage){
    this.playerWindow = playerWindow;
    this.storage = storage;
    this.subscribeToViewEvents(this.playerWindow, ["previous", "next", "pause", "stop", "play", "openFolder"])
    
    this.player = new Twump.PlayerFacade();
    
    this.loadLastList();
  },
  
  subscribeToViewEvents: function(view, events){
    events.each(function(event){
      var fullName = "on" + event.capitalizeEachWord();
      if (this[fullName])
        view[fullName] = this[fullName].bind(this);
    }.bind(this))
  },
  
  openFolder: function(){
    var file = new air.File(); 
    file.addEventListener(air.Event.SELECT, this.dirSelected.bind(this)); 
    file.browseForDirectory('Select folder');
  },
  
  dirSelected: function(event){
    this.stop();
    this.setPlaylist(this.collectMusicFiles(air.File.getFilesRecursive(event.target.nativePath)));
    this.playCurrent();
  },
  
  collectMusicFiles: function(files){
    return files.map(function(fileName){
      return (fileName.toLowerCase().endsWith('.mp3')) ? fileName : null;
    }.bind(this)).compact();
  },
  
  setPlaylist: function(list){
    this.setCurrentIndex(0);
    this.list = list;
  },
  
  playCurrent: function(){
    if (!this.list) return;
    
    this.saveCurrentList();
    
    this.player.play(this.currentFile(), {
      onPlayProgress: this.onPlayProgress.bind(this),
      onPlaybackComplete: this.onPlaybackComplete.bind(this)
    });
  },
  
  onPlayProgress: function(data){
    this.playerWindow.displayPlayProgress(Object.extend(data, {file: this.currentFile()}));
  },
  
  onPlaybackComplete: function(){
    this.onNext();
  },
  
  currentFile: function(){
    if (!this.list) return null;
    return this.list[this.currentIndex()]     
  },
  
  currentIndex: function(){
    return this.current || 0;
  },
  
  setCurrentIndex: function(index){
    if (!this.list || index == null || index >= this.list.length || index < 0)
      return;
  
    this.current = index;  
  },
  
  play: function(index){
    if (!this.list || index == null || index >= this.list.length || index < 0)
      return;
    
    this.stop();
    this.setCurrentIndex(index);
    this.playCurrent();
  },
   
  stop: function(){
    this.player.stop();
    this.playerWindow.clearPlayProgress();
  },
  
  onNext: function(){
    this.play(this.currentIndex() + 1);
  },
  
  onPause: function(){
    this.player.pauseOrResume();
  },
  
  onStop: function(){
    this.stop();
  },
  
  onPlay: function(){
    this.playCurrent();  
  },
  
  onPrevious: function(){
    this.play(this.currentIndex() - 1);
  },
  
  onOpenFolder: function(){
    this.openFolder();
  },
  
  saveCurrentList: function(){
    if (!this.list) return;
    
    this.storage.writeAppData('last_played.twumpl', {
      list: this.list, current: this.currentIndex()
    })
  },
  
  loadLastList: function(){
    var data = this.storage.readAppData('last_played.twumpl');
    if (!data) return;
    this.list = data.list;
    this.play(data.current);
  }
}
