Twump.Controller.PlaylistMixin = {
  setPlaylist: function(playlist){
    this.playlist = playlist;
    this.redrawPlayList();
  },
  
  redrawPlayList: function(){
    this.playlistWindow.display(this.playlist);
  },
  
  refreshCurrentPage: function(){
    this.playlistWindow.refreshCurrentPage();
  },
  
  setPlaylistPlayingItem: function(){
    if (this.playlist.empty()) return;
    
    this.playlistWindow.setPlayingItem(this.playlist.currentFile());
    this.playlistWindow.selectItem(this.playlist.currentFile());
    
    this.autofocusCurrentItem();
  },
  
  autofocusCurrentItem: function(){
    if (!this.playlistWindow.displayed(this.playlist.currentFile()))
      this.playlistWindow.bringPlayingItemToFocus();
  },
  
  onShuffleClick: function(){
    this.playlist.shuffle();
    this.redrawPlayList();
    this.play(0);
  },
  
  onShuffleRemainingClick: function(){
    this.playlist.shuffle(this.playlist.currentIndex() + 1);
    this.refreshCurrentPage();
    this.saveCurrentList();
  },
  
  onDeleteClick: function(){
    this.deleteFromPlaylist(this.playlistWindow.selectedItems());
  },
  
  deleteFromPlaylist: function(items){
    if (this.playlist.empty()) return;
  
    var result = this.playlist.remove(items);

    this.refreshCurrentPage();
    if (result.removedCurrent) {
      this.setPlaylistPlayingItem();
      
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
    this.saveCurrentList();
  },
  
  onEditorClick: function(){
    this.openOrCloseChildWindow('editor', {url: "editor_window.html", 
      playerController: this, playlist: this.playlist
    });
  },
  
  reorderFromPlaylist: function(options){
    this.moveFiles({
      items: this.playlistWindow.selectedItems(), 
      before: this.playlistWindow.itemUnderMouseIndex()
    })
  },
  
  reorderFromEditor: function(options){
    this.moveFiles({
      items: this.childController('editor').selectedItems(), 
      before: this.playlistWindow.itemUnderMouseIndex()
    })
  },
  
  moveFiles: function(options){
    this.playlist.moveBefore(options.items,  options.before);
    this.refreshCurrentPage();
  },
  
  onItemSelected: function(item){
    this.play(item)
  },
  
  onPageChanged: function(files){
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
    this.play(file);
  }
}