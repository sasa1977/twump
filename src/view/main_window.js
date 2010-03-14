Twump.View.MainWindow = Class.create();
Object.extend(Twump.View.MainWindow.prototype, Twump.View.Common);
Object.extend(Twump.View.MainWindow.prototype, {
  initialize: function(options){
    Object.extend(this, options);
    
    this.initResize();
    this.normalizeWindowHeight(window.nativeWindow.height)
  },
  
  onResize: function(height){
    this.normalizeWindowHeight(height);
    this.onResized();
  },
  
  dimensions: function(){
    return ["x", "y", "height", "width"].inject({}, function(memo, property){
      memo[property] = window.nativeWindow[property];
      return memo;
    })
  },
  
  setDimensions: function(dimensions){
    for (property in dimensions)
      window.nativeWindow[property] = dimensions[property];

    if (dimensions.height)    
      this.normalizeWindowHeight(dimensions.height)
  },
  
  normalizeWindowHeight: function(desiredWindowHeight){
    var fixedHeight = ['player', 'header', 'resize'].inject(0, function(memo, id){
      return memo + $(id).clientHeight;
    });
  
    var maxSonglistHeight = desiredWindowHeight - fixedHeight;
    var songlistHeight = this.playlistWindow.normalizedHeight(maxSonglistHeight);
    
    window.nativeWindow.height = fixedHeight + songlistHeight;
    
    this.playlistWindow.onWindowSizeChanged(songlistHeight);
  },
})
