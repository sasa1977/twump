Twump.View.PlayerWindow = Class.create();

Object.extend(Twump.View.PlayerWindow.prototype, Twump.View.Common);

Object.extend(Twump.View.PlayerWindow.prototype, {
  initialize: function(){
    this.insertHeader('player');
    this.setCaption('twump v' + Twump.Api.currentApplicationVersion())
    
    this.addEventListeners("click", 
      [
        "previous", "next", "pause", "stop", "play",
        "openFolder", "addFolder", "loadList", "saveList", "shuffle", "shuffleRemaining", "delete", "clear", 
        "editor"
      ]
    );
     
     this.initSliders();
     
    window.htmlLoader.addEventListener("nativeDragDrop", this.onNativeDragDrop.bind(this));
  },
    
  onNativeDragDrop: function(event){ 
    var data = event.clipboard.getData(air.ClipboardFormats.TEXT_FORMAT);
    if (data && data.match(/^twump\:/)){
      this.onDrop({action: data.gsub("twump:","")});
    }
    else {
      var draggedFiles = $A(event.clipboard.getData(air.ClipboardFormats.FILE_LIST_FORMAT)).map(function(file){
        return file.nativePath;
      });
      
      this.onFilesDropped(Twump.Api.collectMusicPaths(air.File.getFilesRecursive(draggedFiles)))
    }
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
  
  initSliders: function(){
    this.volumeSlider = new Twump.HorizontalSlider('volume', {max: 100, onChange: this.onVolumeSliderChange.bind(this)});
    this.playProgress = new Twump.HorizontalSlider('playProgress', {max: 100, onChange: this.onPlayProgressChange.bind(this)});
  },
  
  setVolume: function(volume){
    this.volumeSlider.setValue(parseInt(volume * 100));
  },
  
  onVolumeSliderChange: function(){this.onVolumeChange(this.volumeSlider.getValue() / 100);},
  
  onPlayProgressChange: function(){
    if(this.inDisplayPlayProgress) return;
    this.onSetPlayPosition(this.playProgress.getValue() / 100);
  }
});
