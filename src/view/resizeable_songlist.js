Twump.View.ResizeableSonglist = {
  initResizeableSonglist: function(songlistWindowReference, fixedElements){
    this.fixedElements = fixedElements;
    this.songlistWindowReference = songlistWindowReference;
    
    this.initResize();
    this.normalizeWindowHeight(window.nativeWindow.height)
  },
  
  onResize: function(height){
    this.normalizeWindowHeight(height);
    setTimeout(this.onWindowResized, 10); // so that window dimension really get updated
  },
  
  setDimensions: function(dimensions){
    if (!dimensions) return;
    
    for (property in dimensions)
      window.nativeWindow[property] = dimensions[property];

    if (dimensions.height)    
      this.normalizeWindowHeight(dimensions.height)
  },
  
  normalizeWindowHeight: function(desiredWindowHeight){
    var fixedHeight = this.fixedElements.inject(0, function(memo, id){
      return memo + $(id).clientHeight;
    });
  
    var maxSonglistHeight = desiredWindowHeight - fixedHeight;
    var songlistHeight = this.songlistWindowReference.normalizedHeight(maxSonglistHeight);
    
    window.nativeWindow.height = fixedHeight + songlistHeight;
    
    this.songlistWindowReference.onWindowSizeChanged(songlistHeight);
  }
}
