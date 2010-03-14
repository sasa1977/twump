Twump.View.MainWindow = Class.create();
Object.extend(Twump.View.MainWindow.prototype, Twump.View.Common);
Object.extend(Twump.View.MainWindow.prototype, {
  initialize: function(options){
    Object.extend(this, options);
    
    this.addEventListener("resize", "mousedown");
    this.normalizeWindowHeight(window.nativeWindow.height)
  },
  
  onResizeMousedown: function(){
    this.resizeMouseMove = this.onResizeMousemove.bind(this);
    document.addEventListener("mousemove", this.resizeMouseMove);
    
    this.resizeMouseUp = this.onResizeMouseup.bind(this);
    document.addEventListener("mouseup", this.resizeMouseUp);
  },
  
  onResizeMouseup: function(){
    if (this.resizeMouseMove){
      document.removeEventListener("mousemove", this.resizeMouseMove);
      this.resizeMouseMove = null;
      
      document.removeEventListener("mouseup", this.resizeMouseUp);
      this.resizeMouseUp = null;
    }
  },
  
  onResizeMousemove: function(event){
    this.normalizeWindowHeight(event.screenY - window.nativeWindow.y)
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
