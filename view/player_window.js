Twump.View = {}

Twump.View.PlayerWindow = Class.create();
Twump.View.PlayerWindow.prototype = {
  initialize: function(){
    this.addEventListener("header", "mousedown");
    
    this.addEventListeners("click", 
      [
        "close", "previous", "next", "pause", "stop", "play",
        "openFolder", "addFolder", "shuffle", "shuffleRemaining", "delete"
      ]
     );
     
     this.initSliders();
  },
  
  addEventListener: function(element, event){
    $(element).addEventListener(event, function(){
      this.invokeEvent("on" + element.capitalizeEachWord())
    }.bind(this));
  },
  
  addEventListeners: function(event, elements){
    elements.each(function(element){
      this.addEventListener(element, event)
    }.bind(this))
  },
  
  invokeEvent: function(event){
    if (this[event])
      this[event]();
  },
  
  displayPlayProgress: function(data){
    this.inDisplayPlayProgress = true;
    
    $('playing').update(data.file);
    $('playlistPos').update("Playing file: " + data.currentIndex + " of " + data.playlistLength)
    $('progress').update("" + data.position + " / " + data.length);
    this.playProgress.setValue(data.playbackPercent);
    
    this.inDisplayPlayProgress = false;
  },
  
  clearPlayProgress: function(){
    $('playing').update();
    $('playlistPos').update();
    $('progress').update()
  },
  
  onClose: function(){
    close();
  },
  
  onHeader: function(){
    window.nativeWindow.startMove();
  },
  
  initSliders: function(){
    this.volumeSlider = new Slider($("volume"), $("volumeInput"), "horizontal");
    this.volumeSlider.onchange = this.onVolumeSliderChange.bind(this);
    this.volumeSlider.setMinimum(0);
    this.volumeSlider.setMaximum(100)
    
    this.playProgress = new Slider($('playProgress'), $('playProgressInput'), "horizontal");
    this.playProgress.onchange = this.onPlayProgressChange.bind(this);
    this.playProgress.setMinimum(0);
    this.playProgress.setMaximum(100);
  },
  
  setVolume: function(volume){
    this.volumeSlider.setValue(parseInt(volume * 100));
  },
  
  onVolumeSliderChange: function(){this.onVolumeChange(this.volumeSlider.getValue() / 100);},
  onPlayProgressChange: function(){
    if(this.inDisplayPlayProgress) return;
    this.onSetPlayPosition(this.playProgress.getValue() / 100);
  }
}
