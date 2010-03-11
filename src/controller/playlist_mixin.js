Twump.Controller.PlaylistMixin = {
  setPlaylist: function(playlist){
    this.playlist = playlist;
    this.redrawPlayList();
  },
  
  redrawPlayList: function(){
    this.playlistWindow.display({
      playlist: this.playlist,
      file: this.currentFile(), 
      start: 0
    });
  },
  
  setPlaylistPlayingItem: function(bringToFocus){
    if (this.playlist.empty()) return;
    
    this.playlistWindow.setPlayingItem(this.currentFile());

    if (bringToFocus)
      this.playlistWindow.bringPlayingItemToFocus();
  },
  
  autofocusCurrentItem: function(){
    if (!this.playlistWindow.displayed(this.currentFile()))
      this.playlistWindow.bringPlayingItemToFocus();
  },
  
  onShuffleClick: function(){
    this.playlist.shuffle();
    this.redrawPlayList();
    this.play(0);
  },
  
  onShuffleRemainingClick: function(){
    this.playlist.shuffle(this.currentIndex() + 1);
    this.redrawPlayList();
    this.saveCurrentList();
  },
  
  onDeleteClick: function(){
    this.deleteFromPlaylist(this.playlistWindow.selectedItems());
  },
  
  deleteFromPlaylist: function(items){
    if (this.playlist.empty()) return;
  
    var currentFileId = this.currentFile().id;
    var newCurrentIndex = this.playlist.deleteFiles(items, this.currentIndex());

    var fileStillInList = this.playlist.file(currentFileId);
    
    this.setCurrentIndex(Math.max(newCurrentIndex, 0));
    this.playlistWindow.refreshCurrentPage();

    if (this.playlist.empty()) return;
    
    if (!fileStillInList){
      newCurrentIndex++;
      
      if (newCurrentIndex < 0)
        newCurrentIndex = 0;
      else if (newCurrentIndex >= this.playlist.length())
        newCurrentIndex = this.playlist.length - 1;
      
      this.setCurrentIndex(newCurrentIndex);
      
      if (this.playing)
        this.playCurrent();
    }
  },
  
  onClearClick: function(){
    if (!confirm('Are you sure?')) return;
    this.stop();
    this.playlist.clear();
    this.setCurrentIndex(0);
    this.redrawPlayList();
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
  
  onEditorClick: function(){
    (this.editorOpened()) ? this.closeEditor() : this.openEditor();
  },
  
  onEditorClosing: function(){
    this.editor = null;
  },
  
  reorderFromPlaylist: function(options){
    this.moveFiles({
      items: this.playlistWindow.selectedItems(), 
      before: this.playlistWindow.itemUnderMouseIndex()
    })
  },
  
  reorderFromEditor: function(options){
    this.moveFiles({
      items: this.editorController().selectedItems(), 
      before: this.playlistWindow.itemUnderMouseIndex()
    })
  },
  
  moveFiles: function(options){
    var newIndex = this.playlist.moveBefore(options.items,  options.before, this.currentFile());
    this.setCurrentIndex(newIndex);
    this.redrawPlayList();
  },
  
  onItemSelected: function(item){
    this.play(this.playlist.indexOf(item))
  },
  
  onScrollChanged: function(files){
    Twump.Utils.scheduleInChunks(    
      files.map(function(file){
        return function(){
          if (file && !file.loadingMetadata) {
            this.loadMetadata(file);
            file.loadingMetadata = true;
          }
        }.bind(this)
      }.bind(this)), {delay: 100}
    )
  },
  
  jumpTo: function(file){
    this.play(this.playlist.indexOf(file));
  }
}
