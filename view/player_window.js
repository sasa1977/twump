Twump.View.PlayerWindow = Class.create();
Twump.View.PlayerWindow.prototype = {
  initialize: function(){
    this.addEventListener("header", "mousedown");
    
    this.addEventListeners("click", 
      [
        "close", "previous", "next", "pause", "stop", "play",
        "openFolder", "addFolder", "shuffle", "shuffleRemaining", "delete", "editor"
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
    $('progress').update((data.length - data.position).secondsToTimeString());
    this.playProgress.setValue(data.playbackPercent);
    
    this.inDisplayPlayProgress = false;
  },
  
  clearPlayProgress: function(){
    $('playing').update();
    $('playlistPos').update();
    $('progress').update()
  },
  
  onHeader: function(){
    window.nativeWindow.startMove();
  },
  
  initSliders: function(){
    this.volumeSlider = this.initSlider('volume', {min: 0, max: 100, direction: 'horizontal',
      onchange: this.onVolumeSliderChange.bind(this)
    })
    
    this.playProgress = this.initSlider('playProgress', {min: 0, max: 100, direction: 'horizontal',
      onchange: this.onPlayProgressChange.bind(this)
    })
  },
  
  initSlider: function(id, options){
    var slider = new Slider($(id), $(id + 'Input'), options.direction);
    
    slider.onchange = options.onchange;
    slider.setMinimum(options.min);
    slider.setMaximum(options.max);
    
    return slider;
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
