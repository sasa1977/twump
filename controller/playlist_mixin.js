Twump.Controller.PlaylistMixin = {
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

  onOpenFolderClick: function(){
    this.openFolder();
  },
  
  onAddFolderClick: function(){
   (this.playlist.empty()) ? this.openFolder() : this.addFolder();
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
    if (!this.indexOk(this.currentIndex())) return;
    
    this.playlist.deleteAt(this.currentIndex());
    this.redrawPlayList();
    this.playCurrent();
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
}
