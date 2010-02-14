Twump.Player = Class.create();
Twump.Player.prototype = {
  initialize: function(file, options){
    this.options = options || {}  
        
    this.sound = new air.Sound(new air.URLRequest(air.File.url(file)))
    this.play();
  },
  
  play: function(position){
    this.channel = this.sound.play(position || 0)
    this.channel.addEventListener(air.Event.SOUND_COMPLETE, this.onPlaybackComplete.bind(this));
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
    this.channel = null;
    this.timer = null;
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

    this.player.stop();
    this.player = null;
  },
  
  playing: function(){
    return (this.player != null)
  }
}

