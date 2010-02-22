Twump.Player = Class.create();
Twump.Player.prototype = {
  initialize: function(file, options){
    this.options = options || {}  
        
    this.sound = Twump.Api.sound(file)
    this.play();
  },
  
  play: function(position){
    this.soundCompleteDelegate = this.onPlaybackComplete.bind(this);
    
    this.channel = this.sound.play(position || 0, 0, new air.SoundTransform(this.options.volume || 0.5, 0))
    this.channel.addEventListener(air.Event.SOUND_COMPLETE, this.soundCompleteDelegate);
    this.timer = setInterval(this.monitorPlaying.bind(this), 500);
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
    
    clearInterval(this.timer);
    this.channel.stop();
    this.channel.removeEventListener(air.Event.SOUND_COMPLETE, this.soundCompleteDelegate)
    this.channel = null;
    this.timer = null;
  },
  
  destruct: function(){
    this.stop();
    this.sound.close();
    this.sound = null;
  },
  
  monitorPlaying: function(){
    if (!this.playing()) return;
    
    var estimatedLength = Math.ceil(this.sound.length / (this.sound.bytesLoaded / this.sound.bytesTotal)); 
    this.invokeCallback("PlayProgress", {
      playbackPercent: Math.round(100 * (this.channel.position / estimatedLength)), 
      position: parseInt(this.channel.position / 1000), 
      length: parseInt(this.sound.length / 1000)
     })
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
};



Twump.PlayerFacade = Class.create();
Twump.PlayerFacade.prototype = {
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
  }
}

