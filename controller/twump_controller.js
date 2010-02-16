Twump.Controller = Class.create()
Twump.Controller.prototype = {
  initialize: function(options){
    Object.extend(this, options);
    
    this.subscribeToViewEvents(this.playerWindow, 
      [
        "windowClosing", "previous", "next", "pause", "stop", "play", "volumeChange", "setPlayPosition",
        "openFolder", "addFolder", "shuffle", "shuffleRemaining", "delete", "editor"
      ]
    )
    
    this.player = new Twump.PlayerFacade();
    this.setPlaylist([])
    this.loadPlayerData();
    this.loadLastList();
  },
  
  setVolume: function(volume){
    this.volume = volume;
    this.playerWindow.setVolume(volume);
    this.savePlayerData();
  },
  
  subscribeToViewEvents: function(view, events){
    events.each(function(event){
      var fullName = "on" + event.capitalizeEachWord();
      if (this[fullName])
        view[fullName] = this[fullName].bind(this);
    }.bind(this))
  },
  
  openFolder: function(){
    this.doOpenFolder({onSelect: this.openFolderSelected.bind(this)})
  },
  
  openFolderSelected: function(files){
    this.stop();
    this.setPlaylist(files);
    this.playCurrent();
  },
  
  addFolder: function(){
    this.doOpenFolder({onSelect: this.addFolderSelected.bind(this)})
  },
  
  addFolderSelected: function(newFiles){
    this.playlist.insertAt(this.currentIndex() + 1, newFiles);
    this.refreshPlaylist();
  },
  
  doOpenFolder: function(options){
    var file = new air.File(); 
    file.addEventListener(air.Event.SELECT, function(event){
      options.onSelect(this.collectMusicFiles(air.File.getFilesRecursive(event.target.nativePath)))
    }.bind(this)); 
    file.browseForDirectory('Select folder');
  
  },
  
  collectMusicFiles: function(files){
    return files.map(function(fileName){
      return (fileName.toLowerCase().endsWith('.mp3')) ? fileName : null;
    }.bind(this)).compact();
  },
  
  setPlaylist: function(list, index){
    this.playlist = new Twump.Model.Playlist(list);
    this.setCurrentIndex(index || 0);
    this.refreshPlaylist();
  },
  
  refreshPlaylist: function(){
    this.playlistWindow.display(this.playlist);
  },
  
  playCurrent: function(){
    this.stop();
    this.saveCurrentList();
    
    if (!this.currentFile()) return;
    
    this.playlistWindow.selectItem(this.currentIndex());
    
    this.player.play(this.currentFile(), {
      volume: this.volume,
      onPlayProgress: this.onPlayProgress.bind(this),
      onPlaybackComplete: this.onPlaybackComplete.bind(this)
    });
  },
  
  onPlayProgress: function(data){
    this.playerWindow.displayPlayProgress(
      Object.extend(data, {
        file: this.currentFile().split(/(\\|\/)/).last()
      })
     );
  },
  
  onPlaybackComplete: function(){
    this.stop();
    this.onNext();
  },
  
  currentFile: function(){
    return this.playlist.get(this.currentIndex())
  },
  
  currentIndex: function(){
    return this.current || 0;
  },
  
  indexOk: function(index){
    return index >= 0 && index < this.playlist.length();
  },
  
  setCurrentIndex: function(index){
    if (!this.indexOk(index)) return;
  
    this.current = index;  
  },
  
  play: function(index){
    if (!this.indexOk(index)) return;
    
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
  
  onAddFolder: function(){
   (this.playlist.empty()) ? this.onOpenFolder() : this.addFolder();
  },
  
  onShuffle: function(){
    this.playlist.shuffle();
    this.refreshPlaylist();
    this.play(0);
  },
  
  onShuffleRemaining: function(){
    this.playlist.shuffle(this.currentIndex() + 1);
    this.refreshPlaylist();
    this.saveCurrentList();
  },
  
  onDelete: function(){
    if (!this.indexOk(this.currentIndex())) return;
    
    this.playlist.deleteAt(this.currentIndex());
    this.refreshPlaylist();
    this.playCurrent();
  },
  
  
  onVolumeChange: function(volume){
    this.setVolume(volume);
    this.player.setVolume(volume);
  },
  
  onSetPlayPosition: function(position){
    this.player.setPosition(position);
  },
  
  savePlayerData: function(){
    this.storage.writeAppData('app_data.dat', {
      volume: this.volume
    })
  },
  
  loadPlayerData: function(){
    var data = this.storage.readAppData('app_data.dat');
    if (!data) return;
    this.setVolume(data.volume);
  },
  
  saveCurrentList: function(){
    this.storage.writeAppData('last_played.twumpl', {
      list: this.playlist.files, current: this.currentIndex()
    })
  },
  
  loadLastList: function(){
    var data = this.storage.readAppData('last_played.twumpl');
    if (!data) return;
    
    this.setPlaylist(data.list, data.current);
    this.playCurrent();
  },
  
  onWindowClosing: function(){
    this.closeEditor();
  },
  
  editorOpened: function(){
    return (this.editor != null)
  },
  
  closeEditor: function(){
    if (!this.editorOpened()) return;
    this.editor.window.close();
    this.editor = null;
  },
  
  openEditor: function(){
    if (this.editorOpened()) return;
    this.editor = Twump.Api.newWindow({url: "playlist_editor.html", playerController: this})
  },
  
  onEditor: function(){
    (this.editorOpened()) ? this.closeEditor() : this.openEditor();
  }
}
