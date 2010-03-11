Twump.Controller.PlayerMixin = {
  currentFile: function(){
    return this.playlist.fileAt(this.currentIndex());
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
    this.setPlaylistPlayingItem();
    this.savePlayerData();
  },

  setVolume: function(volume){
    this.volume = volume;
    this.playerWindow.setVolume(volume);
    this.savePlayerData();
  },
  
  onVolumeChange: function(volume){
    this.setVolume(volume);
    this.player.setVolume(volume);
  },
  
  onVolumeUp: function(){
    this.onVolumeChange(Math.min(this.volume + 0.05, 1.0))
  },
  
  onVolumeDown: function(){
    this.onVolumeChange(Math.max(this.volume - 0.05, 0))
  },
  
  playCurrent: function(){
    this.stop();
    this.saveCurrentList();
    
    air.System.gc();
       
    if (!this.currentFile()) return;
    
    if (!this.playlistWindow.displayed(this.currentFile()))
      this.playlistWindow.bringPlayingItemToFocus();

    this.playlistWindow.selectItem(this.currentFile());

    this.loadMetadata(this.currentFile(), true);
    
    this.playing = true;
    
    this.logger.log('playing: ' + this.currentFile().path)
    
    this.player.play(this.currentFile().path, {
      volume: this.volume,
      onPlayProgress: this.onPlayProgress.bind(this),
      onPlaybackComplete: this.onPlaybackComplete.bind(this)
    });
  },
  
  loadMetadata: function(file, force){
    if (!force && file.metadataLoaded())
      return;
    
    Twump.Api.songMetadata(file.path, function(metadata){
      file.addMetadata(metadata);
      this.playlistWindow.refreshItem(file);
    }.bind(this));
  },
  
  onPlayProgress: function(data){
    var completeData = Object.extend(data, {file: this.currentFile().displayName});
  
    this.playerWindow.displayPlayProgress(completeData);
    this.lastFmPlayProgress(completeData);
  },
  
  onPlaybackComplete: function(){
    this.stop();
    this.onNextClick();
  },
  
  play: function(index){
    if (!this.indexOk(index)) return;

    this.setCurrentIndex(index);
    this.playCurrent();
  },
   
  stop: function(){
    this.playing = false;
    this.lastFm.scrobbleQueued();
  
    this.startedPlaying = null;
    this.scrobbledCurrent = null;
    
    this.player.stop();
    this.playerWindow.clearPlayProgress();
  },
  
  onNextClick: function(){
    this.play(this.currentIndex() + 1);
  },
  
  onPauseClick: function(){
    this.player.pauseOrResume();
  },
  
  onStopClick: function(){
    this.stop();
  },
  
  onPlayClick: function(){
    this.play(this.currentIndex());  
  },
  
  onPreviousClick: function(){
    this.play(this.currentIndex() - 1);
  },
  
  onSetPlayPosition: function(position){
    this.player.setPosition(position);
  },
  
  onMoveForward: function(){
    this.player.setPosition(Math.min(this.player.playbackPercent() / 100 + 0.05, 1.0));
  },
  
  onMoveBackward: function(){
    this.player.setPosition(Math.max(this.player.playbackPercent() / 100 - 0.05, 0));
  }
}
