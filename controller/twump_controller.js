Twump.Controller = Class.create()
Twump.Controller.prototype = {
  initialize: function(playerWindow, storage){
    this.playerWindow = playerWindow;
    this.storage = storage;
    this.subscribeToViewEvents(this.playerWindow, 
      ["previous", "next", "pause", "stop", "play", "openFolder", "shuffle"]
    )
    
    this.player = new Twump.PlayerFacade();
    this.setPlaylist([])
    
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
  
  setPlaylist: function(list, index){
    this.playlist = new Twump.Model.Playlist(list);
    this.setCurrentIndex(index || 0);
  },
  
  playCurrent: function(){
    if (!this.currentFile()) return;
  
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
    return this.playlist.get(this.currentIndex())
  },
  
  currentIndex: function(){
    return this.current || 0;
  },
  
  indexOk: function(index){
    return index >= 0 && index < this.playlist.list.length;
  },
  
  setCurrentIndex: function(index){
    if (!this.indexOk(index)) return;
  
    this.current = index;  
  },
  
  play: function(index){
    if (!this.indexOk(index)) return;
    
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
  
  onShuffle: function(){
    this.playlist.shuffle();
    this.play(0);
  },
  
  saveCurrentList: function(){
    this.storage.writeAppData('last_played.twumpl', {
      list: this.playlist.list, current: this.currentIndex()
    })
  },
  
  loadLastList: function(){
    var data = this.storage.readAppData('last_played.twumpl');
    if (!data) return;
    
    this.setPlaylist(data.list, data.current);
    this.playCurrent();
  }
}
