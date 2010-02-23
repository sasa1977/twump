Twump.Controller.PlayerMixin = {
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
  },

  setVolume: function(volume){
    this.volume = volume;
    this.playerWindow.setVolume(volume);
    this.savePlayerData();
  },
  
  playCurrent: function(){
    this.stop();
    this.saveCurrentList();
    
    if (!this.currentFile()) return;
    
    this.setPlaylistPlayingItem();
    this.playlistWindow.selectItem(this.currentFile().id);
    
    this.loadMetadata(this.currentFile());
    
    this.playing = true;
    
    this.player.play(this.currentFile().path, {
      volume: this.volume,
      onPlayProgress: this.onPlayProgress.bind(this),
      onPlaybackComplete: this.onPlaybackComplete.bind(this)
    });
  },
  
  loadMetadata: function(file){
    if (file.metadataLoaded())
      return;
      
    Twump.Api.songMetadata(file.path, function(metadata){
      file.metadata = metadata;
      this.playlistWindow.refreshItem(file);
    }.bind(this));
  },
  
  onPlayProgress: function(data){
    var completeData = Object.extend(data, {file: this.currentFile().displayName()});
  
    this.playerWindow.displayPlayProgress(completeData);
    this.lastFmPlayProgress(completeData);
  },
  
  lastFmPlayProgress: function(data){
    if (!this.scrobbleCurrentPossible()) return;
  
    if (this.progressStep == 0)
      this.lastFmNowPlaying();

    this.progressStep = (this.progressStep + 1) % 10;
    
    if (!this.startedPlaying)
        this.startedPlaying = Math.round(new Date().getTime() / 1000);
    
    if (this.readyForScrobble(data))
      this.scrobbleCurrent(data);
  },
  
  lastFmNowPlaying: function(){
    this.lastFm.nowPlaying(this.currentFile().metadata)
  },
  
  scrobbleCurrent: function(data){
    var file = this.currentFile();
    
    var arg = Object.extend({startedPlaying: this.startedPlaying}, data);
    Object.extend(arg, this.currentFile().metadata)
    
    this.lastFm.pushForScrobble(arg)
    this.scrobbledCurrent = true;
  },
  
  scrobbleCurrentPossible: function(){
    var file = this.currentFile();
    return (file.metadata && file.metadata.name.length > 0 && file.metadata.performer.length > 0);
  },
  
  readyForScrobble: function(playingData){
    return (
      this.scrobbleCurrentPossible() && !this.scrobbledCurrent &&
      (playingData.position > 240 || playingData.position >= playingData.length / 2)
    )
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
    this.playing = true;
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
    this.playCurrent();  
  },
  
  onPreviousClick: function(){
    this.play(this.currentIndex() - 1);
  },
  
  onVolumeChange: function(volume){
    this.setVolume(volume);
    this.player.setVolume(volume);
  },
  
  onSetPlayPosition: function(position){
    this.player.setPosition(position);
  }
}
