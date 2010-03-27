Twump.View.PlayerWindow = Class.create();

Object.extend(Twump.View.PlayerWindow.prototype, Twump.View.Common);

Object.extend(Twump.View.PlayerWindow.prototype, {
  initialize: function(){
    this.setCaption('twump v' + Twump.Api.currentApplicationVersion())
    
    this.addEventListeners("click", 
      [
        "previous", "next", "pause", "stop", "play",
        "openFolder", "loadList", "saveList", "shuffle", "shuffleRemaining", "delete", "clear", 
        "editor", "options", "repeat"
      ]
    );
     
     this.initSliders();
     
    window.htmlLoader.addEventListener("nativeDragDrop", this.onNativeDragDrop.bind(this));
  },
  
  onOpenFolderClick: function(event){
    this.openContextMenu(event, [
      {id: 'addFolderAtEnd', title: 'add folder at the end', onClick: this.onAddFolderAtEndClick.bind(this)},
      {id: 'addFolderAfterCurrent', title: 'add folder after current', onClick: this.onAddFolderAfterCurrentClick.bind(this)}
    ]);
    
    Event.stop(event)
  },
  
  onAddFolderAfterCurrentClick: function(){
    this.onAddFolderAfterCurrent();
  },
  
  onAddFolderAtEndClick: function(){
    this.onAddFolderAtEnd();
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
    
    $('playing').update('<nobr>' + data.file + '</nobr>');
    $('remaining').update((data.length - data.position).secondsToTimeString());
    this.playProgress.setValue(data.playbackPercent);
    
    this.inDisplayPlayProgress = false;
  },
  
  clearPlayProgress: function(){
    $('playing').update();
    $('remaining').update();
    this.playProgress.setValue(0);
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
    this.onSetPlayPosition(this.playProgress.getValue() / 100);
  },
  
  showPlaylistState: function(playlist){
    $('repeat').update(playlist.repeatMode || "no")
  },
  
  onRepeatClick: function(event){
    Event.stop(event);
    
    this.openContextMenu(event, [
      {id: 'noRepeat', title: 'no repeat', onClick: this.onNoRepeatClick.bind(this)},
      {id: 'repeatLinear', title: 'repeat', onClick: this.onRepeatLinearClick.bind(this)},
      {id: 'repeatShuffle', title: 'reshuffle and repeat', onClick: this.onRepeatShuffleClick.bind(this)}
    ]);
  },
  
  onNoRepeatClick: function(){
    this.onRepeatMode("no");
  },
  
  onRepeatLinearClick: function(){
    this.onRepeatMode("repeat");
  },
  
  onRepeatShuffleClick: function(){
    this.onRepeatMode("reshuffle");
  }
});
