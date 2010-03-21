Twump.View.MainWindow = Class.create();
Object.extend(Twump.View.MainWindow.prototype, Twump.View.Common);
Object.extend(Twump.View.MainWindow.prototype, Twump.View.ResizeableSonglist);
Object.extend(Twump.View.MainWindow.prototype, {
  initialize: function(options){
    Object.extend(this, options);
    
    this.initResizeableSonglist(this.playlistWindow, ['player', 'header', 'resize']);
    
    window.nativeWindow.addEventListener("move", function(){this.onWindowResized()}.bind(this))
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
  }
})
