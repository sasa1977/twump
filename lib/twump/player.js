Twump.Player = Class.create();
Twump.Player.prototype = {
  initialize: function(file, options){
    this.options = options || {}  
        
    this.playing = new air.Sound(new air.URLRequest(air.File.url(file)))
    this.channel = this.playing.play()
    this.channel.addEventListener(air.Event.SOUND_COMPLETE, this.onPlaybackComplete.bind(this));
    
    this.timer = setInterval(this.monitorPlaying.bind(this), 500);
  },
  
  stop: function(){
    if (this.channel){
      clearInterval(this.timer);
      
      this.channel.stop();
      this.channel = null;
      this.timer = null;
    }
  },
  
  monitorPlaying: function(){
    if (this.channel){          
      var estimatedLength = Math.ceil(this.playing.length / (this.playing.bytesLoaded / this.playing.bytesTotal)); 
      
      this.invokeCallback("PlayProgress", {
        playbackPercent: Math.round(100 * (this.channel.position / estimatedLength)), 
        position: parseInt(this.channel.position / 1000), 
        length: parseInt(this.playing.length / 1000)
      })
    }
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
  
  stop: function(){
    if (this.player){
      this.player.stop();
      this.player = null;
    }
  }
}

