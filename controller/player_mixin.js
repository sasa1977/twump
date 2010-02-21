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
    
    this.selectCurrentItemInPlaylistWindow();
    
    this.loadMetadata(this.currentFile());
    
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
    this.playerWindow.displayPlayProgress(
      Object.extend(data, {file: this.currentFile().displayName()})
     );
     
     if (this.progressStep == 0)
       this.lastFm.nowPlaying(this.currentFile())

     this.progressStep = (this.progressStep + 1) % 10;
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
