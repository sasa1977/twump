Twump.Controller.Player = Class.create()

Object.extend(Twump.Controller.Player.prototype, Twump.Controller.Common);

Object.extend(Twump.Controller.Player.prototype, {
  initialize: function(options){
    Object.extend(this, options);
    
    this.subscribeToViewEvents(this.playerWindow, 
      [
        "windowClosing", "previous", "next", "pause", "stop", "play", "volumeChange", "setPlayPosition",
        "openFolder", "addFolder", "shuffle", "shuffleRemaining", "delete", "clear","editor", "drop"
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
  
  openFolder: function(){
    Twump.Api.openFolder({onSelect: this.openFolderSelected.bind(this)})
  },
  
  openFolderSelected: function(paths){
    this.stop();
    this.setPlaylist(paths);
    this.playCurrent();
  },
  
  addFolder: function(){
    Twump.Api.openFolder({onSelect: this.addFolderSelected.bind(this)})
  },
  
  addFolderSelected: function(newFiles){
    this.playlist.insertPathsAt(this.currentIndex() + 1, newFiles);
    this.redrawPlayList();
  },
  
  setPlaylist: function(list, index){
    this.playlist = new Twump.Model.Playlist(list);
    this.setCurrentIndex(index || 0);
    this.redrawPlayList();
  },
  
  redrawPlayList: function(){
    this.playlistWindow.display(this.playlist);
  },
  
  selectCurrentItemInPlaylistWindow: function(){
    this.playlistWindow.selectItem(this.currentFile());
  },
  
  playCurrent: function(){
    this.stop();
    this.saveCurrentList();
    
    if (!this.currentFile()) return;
    
    this.selectCurrentItemInPlaylistWindow();
    
    this.player.play(this.currentFile().path, {
      volume: this.volume,
      onPlayProgress: this.onPlayProgress.bind(this),
      onPlaybackComplete: this.onPlaybackComplete.bind(this)
    });
  },
  
  onPlayProgress: function(data){
    this.playerWindow.displayPlayProgress(
      Object.extend(data, {
        file: this.currentFile().path.split(/(\\|\/)/).last()
      })
     );
  },
  
  onPlaybackComplete: function(){
    this.stop();
    this.onNext();
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
    this.redrawPlayList();
    this.play(0);
  },
  
  onShuffleRemaining: function(){
    this.playlist.shuffle(this.currentIndex() + 1);
    this.redrawPlayList();
    this.saveCurrentList();
  },
  
  onDelete: function(){
    if (!this.indexOk(this.currentIndex())) return;
    
    this.playlist.deleteAt(this.currentIndex());
    this.redrawPlayList();
    this.playCurrent();
  },
  
  onClear: function(){
    if (!confirm('Are you sure?')) return;
    this.stop();
    this.playlist.clear();
    this.setCurrentIndex(0);
    this.redrawPlayList();
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
      list: this.playlist.paths(), current: this.currentIndex()
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
  
  editorController: function(){
    if (!this.editorOpened()) return null;
    return this.editor.window.controller;
  },
  
  closeEditor: function(){
    if (!this.editorOpened()) return;
    this.editor.window.close();
    this.editor = null;
  },
  
  openEditor: function(){
    if (this.editorOpened()) return;
    this.editor = Twump.Api.newWindow({url: "editor_window.html", 
      playerController: this, playlist: this.playlist
    })
  },
  
  onEditor: function(){
    (this.editorOpened()) ? this.closeEditor() : this.openEditor();
  },
  
  onEditorClosing: function(){
    this.editor = null;
  },
  
  currentFile: function(){
    return this.playlist.fileAt(this.currentIndex());
  },
  
  onDrop: function(options){
    this[options.action](options);
  },
  
  moveAfter: function(options){
    var newIndex = this.playlist.moveAfter(
      this.editorController().selectedItems(), 
      this.playlistWindow.itemUnderMouseIndex,
      this.currentFile()
    );
    
    this.setCurrentIndex(newIndex);
    this.redrawPlayList();
    this.selectCurrentItemInPlaylistWindow();
  }
})
