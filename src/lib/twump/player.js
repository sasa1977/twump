Twump.Player = Class.define({
  initialize: function(file, options){
    this.options = options || {}  
        
    this.sound = Twump.Api.sound(file)
    this.play();
  },
  
  play: function(position){
    this.channel = this.sound.play(position || 0, 0, new air.SoundTransform(this.options.volume || 0.5, 0))
    this.startMonitorPlaying();
  },
  
  pauseOrResume: function(){
    (this.playing()) ? this.doPause() : this.doResume();
  },
  
  doPause: function(){
    if (!this.playing()) return;
    this.lastPosition = this.channel.position;
    this.stop();
  },
  
  doResume: function(){
    if (this.playing()) return;
    
    this.play(this.lastPosition || 0);
    this.lastPosition = null;
  },
  
  playing: function(){
    return (this.channel != null);
  },
  
  stop: function(){
    if (!this.playing()) return;
    
    this.stopMonitorPlaying();
    this.channel.stop();
    this.channel = null;
  },
  
  destruct: function(){
    this.stop();
    if (this.sound){
      // sound.close throws if sound is not streaming anymore, which is not an error, so swallow that exception
      try {this.sound.close();} catch(e){}

      this.sound = null;
    }
  },
  
  startMonitorPlaying: function(){
    if (this.timer) return;
    this.timer = setInterval(this.monitorPlaying.bind(this), 500);
    this.lastMonitoredPosition = null;
    this.notChangedTimes = 0;
  },
  
  stopMonitorPlaying: function(){
    if (!this.timer) return;
    this.timer = null;
    this.lastMonitoredPosition = null;
    clearInterval(this.timer);
  },
  
  isPlayingFinished: function() {
    // SOUND_COMPLETE event in air sometimes fires too early, sometimes doesn't even fire. Therefore
    // I do this heuristic.
    
    // 1. if the song is longer than one minute, and we're at the end -> finish.
    //
    // The one minute check is because the song is loading simultaneously as it is being played. 
    // Therefore it might happen at the beginning that the position equals the length of currently loaded part. 
    // To avoid false end detection, I don't use this condition in the first minute of playing.
    if (this.channel.length >= 60000 && this.channel.position >= this.sound.length)
      return true;
    
    // 2. If I repeatedly don't notice position change -> finish.
    //
    // This part handles the situation when playing is stuck before the end of the song, and also
    // to handle the songs shorter than one minute (see comment above)
    if (!this.lastMonitoredPositionChanged())
      this.notChangedTimes++;
    else
      this.notChangedTimes = 0;

    // I return true (playing finished) only when the position didn't change for couple of successive cheks
    // to avoid false detection when the user changes playing position. Otherwise it might happen that the user 
    // changes to the position which is the same as the last detected, and I mistakenly detect no position change.
    return this.notChangedTimes >= 4;
  },
  
  lastMonitoredPositionChanged: function(){
    return (!this.lastMonitoredPosition) || (this.lastMonitoredPosition != this.channel.position);
  },
  
  monitorPlaying: function(){
    if (!this.playing()) return;
    
    if (!this.isPlayingFinished())
      this.fireProgress();
    else
      this.onPlaybackComplete();
  },
  
  fireProgress: function(){
    this.lastMonitoredPosition = this.channel.position;

    var estimatedLength = Math.ceil(this.sound.length / (this.sound.bytesLoaded / this.sound.bytesTotal)); 
    this.invokeCallback("PlayProgress", {
      playbackPercent: this.playbackPercent(), 
      position: parseInt(this.channel.position / 1000), 
      length: parseInt(this.sound.length / 1000)
     })
  },
  
  playbackPercent: function(){
    var estimatedLength = Math.ceil(this.sound.length / (this.sound.bytesLoaded / this.sound.bytesTotal));
    var position = (this.playing() ? this.channel.position : this.lastPosition);
    
    return Math.round(100 * (position / estimatedLength));
  },
  
  onPlaybackComplete: function(){
    this.stop();
    this.invokeCallback("PlaybackComplete");
  },
  
  setVolume: function(volume){
    if (!this.playing()) return;

    this.channel.soundTransform = new air.SoundTransform(volume, this.channel.soundTransform.pan);
  },
  
  setPosition: function(position){
    if (!this.playing()) return;
    
    this.stop();
    this.play(this.sound.length * position);
  },
  
  invokeCallback: function(callback, arg){
    var callback = this.options["on" + callback];
    if (callback)
      callback(arg);
  }
});



Twump.PlayerFacade = Class.define({
  initialize: function(){},
  
  play: function(file, options){
    this.stop();
    this.player = new Twump.Player(file, options)
  },
  
  pauseOrResume: function(){
    if (!this.playing()) return;
    this.player.pauseOrResume();
  },
  
  stop: function(){
    if (!this.playing()) return;

    this.player.destruct();
    this.player = null;
  },
  
  playing: function(){
    return (this.player != null)
  },
  
  setVolume: function(volume){
    if (!this.playing()) return;
    this.player.setVolume(volume);
  },
  
  setPosition: function(position){
    if (!this.playing()) return;
    this.player.setPosition(position)
  },
  
  playbackPercent: function(){
    if (!this.playing()) return 0;
    return this.player.playbackPercent();
  }
});