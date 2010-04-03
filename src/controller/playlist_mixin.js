Twump.Controller.PlaylistMixin = {
  setPlaylist: function(playlist){
    this.playlist = playlist;
    this.playlist.repeatMode = this.options.playlistRepeatMode;
    this.redrawPlayList();
  },
  
  redrawPlayList: function(){
    this.playlistWindow.display(this.playlist);
    this.playerWindow.showPlaylistState(this.playlist);
  },
  
  refreshCurrentPage: function(){
    this.playlistWindow.refreshCurrentPage();
  },
  
  setPlaylistPlayingItem: function(){
    if (this.playlist.empty()) return;
    
    this.playlistWindow.setPlayingItem(this.playlist.currentSong());
    this.playlistWindow.selectItem(this.playlist.currentSong());
    
    this.autofocusCurrentItem();
  },
  
  autofocusCurrentItem: function(){
    if (!this.playlistWindow.displayed(this.playlist.currentSong()))
      this.playlistWindow.bringPlayingItemToFocus();
  },
  
  onShuffleClick: function(){
    this.playlist.shuffle();
    this.redrawPlayList();
    this.play(this.playlist.first());
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
    this.moveSongs({
      items: this.playlistWindow.selectedItems(), 
      before: this.playlistWindow.itemUnderMouseIndex()
    })
  },
  
  reorderFromEditor: function(options){
    this.moveSongs({
      items: this.childController('editor').selectedItems(), 
      before: this.playlistWindow.itemUnderMouseIndex()
    })
  },
  
  moveSongs: function(options){
    this.playlist.moveBefore(options.items,  options.before);
    this.refreshCurrentPage();
  },
  
  onItemSelected: function(item){
    this.play(item)
  },
  
  onPageChanged: function(songs){
    Twump.Utils.scheduleInChunks(    
      songs.map(function(song){
        return function(){
          if (song && !song.loadingMetadata) {
            this.loadMetadata(song);
            song.loadingMetadata = true;
          }
        }.bind(this)
      }.bind(this)), {delay: 100}
    )
  },
  
  jumpTo: function(song){
    this.play(song);
  },
  
  onSetRepeatPattern: function(songs, reshuffle){
    this.playlist.setRepeatPattern(songs || [], reshuffle);
    this.playlistWindow.setRepeatPattern(songs || [])
  },
  
  onShuffleSelection: function(){
    this.playlist.shuffleSongs(this.playlistWindow.selectedItems());
    this.refreshCurrentPage();
  },
  
  onShowCurrentClick: function(){
    this.autofocusCurrentItem();
  }
}