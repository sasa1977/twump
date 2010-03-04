Twump.Controller.PlaylistMixin = {
  setPlaylist: function(playlist){
    this.playlist = playlist;
    this.redrawPlayList();
  },
  
  redrawPlayList: function(){
    this.playlistWindow.display({
      playlist: this.playlist,
      file: this.currentFile(), 
      range: 10
    });
  },
  
  setPlaylistPlayingItem: function(){
    if (this.playlist.empty()) return;
    
    this.playlistWindow.setPlayingItem(this.currentFile(), this.currentIndex());
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
    this.deleteFromPlaylist(this.playlistWindow.selectedIds());
  },
  
  deleteFromPlaylist: function(ids){
    if (this.playlist.empty()) return;
  
    var currentFileId = this.currentFile().id;
    var newCurrentIndex = this.playlist.deleteFiles(ids, this.currentIndex());

    var fileStillInList = this.playlist.file(currentFileId);
    
    this.setCurrentIndex(Math.max(newCurrentIndex, 0));
    this.redrawPlayList();

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
  
  moveBefore: function(options){
    var newIndex = this.playlist.moveBefore(
      this.editorController().selectedItems(), 
      this.playlistWindow.itemUnderMouseIndex,
      this.currentFile()
    );
    
    this.setCurrentIndex(newIndex);
    
    this.redrawPlayList();
  },
  
  onItemSelected: function(id){
    this.play(this.playlist.idToIndex(id))
  },
  
  onCopyPathToClipboard: function(fileId){
    Twump.Api.copyTextToClipboard(this.playlist.file(fileId).path);
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
  
  jumpTo: function(fileId){
    this.play(this.playlist.idToIndex(fileId));
  }
}
