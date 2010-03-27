Twump.Controller.PlayerMixin = {
  setCurrentFile: function(file){
    this.playlist.setCurrentFile(file);
    if (!file) return;
    
    this.setPlaylistPlayingItem();
    this.savePlayerData();
  },
  
  setCurrentIndex: function(index){
    this.setCurrentFile(this.playlist.itemAt(index))
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
       
    if (!this.playlist.currentFile()) return;
    
    this.loadMetadata(this.playlist.currentFile(), true);
    
    this.playing = true;
    
    this.logger.log('playing: ' + this.playlist.currentFile().path)
    
    this.player.play(this.playlist.currentFile().path, {
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
    var completeData = Object.extend(data, {file: this.playlist.currentFile().displayName});
  
    this.playerWindow.displayPlayProgress(completeData);
    this.lastFmPlayProgress(completeData);
  },
  
  onPlaybackComplete: function(){
    this.stop();
    this.onNextClick();
  },
  
  play: function(file){
    if (!file) return;

    this.setCurrentFile(file);
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
    var playingInfo = this.playlist.nextPlaying();
    this.play(playingInfo.file);

    if (playingInfo.reshuffled)
      this.redrawPlayList();
  },
  
  onPauseClick: function(){
    this.player.pauseOrResume();
  },
  
  onStopClick: function(){
    this.stop();
  },
  
  onPlayClick: function(){
    this.play(this.playlist.currentFile());  
  },
  
  onPreviousClick: function(){
    this.play(this.playlist.previousPlaying());
  },
  
  onSetPlayPosition: function(position){
    this.player.setPosition(position);
  },
  
  onMoveForward: function(){
    this.player.setPosition(Math.min(this.player.playbackPercent() / 100 + 0.05, 1.0));
  },
  
  onMoveBackward: function(){
    this.player.setPosition(Math.max(this.player.playbackPercent() / 100 - 0.05, 0));
  },
  
  onRepeatMode: function(mode){
    this.playlist.repeatMode = mode;
    this.playerWindow.showPlaylistState(this.playlist);
    this.savePlayerData();
  }
}
