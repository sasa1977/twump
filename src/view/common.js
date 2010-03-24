Twump.View.Common = {
  addEventListener: function(element, event){
    $(element).addEventListener(event, function(data){
      this.invokeEvent("on" + element.capitalizeEachWord() + event.capitalizeEachWord(), data)
    }.bind(this), false);
  },
  
  addEventListeners: function(event, elements){
    elements.each(function(element){
      this.addEventListener(element, event)
    }.bind(this))
  },
  
  invokeEvent: function(event, data){
    if (this[event])
      this[event](data);
  },
  
  insertHeader: function(parentId){
    this.addEventListener("close", "click");
    this.onCloseClick = function(){
      if (this.onWindowClosing)
        this.onWindowClosing();
      close();
    }
    
    window.nativeWindow.addEventListener('closing', function(){
      if (this.onWindowClosing)
        this.onWindowClosing();
    }.bind(this))
    
    this.addEventListener("close", "mousedown");
    this.onCloseMousedown = function(event){
      Event.stop(event);
    }
    
    this.addEventListener("header", "mousedown");
    this.onHeaderMousedown = function(){
      window.nativeWindow.startMove();
    }
    
    window.nativeWindow.addEventListener("move", function(){
      if (this.onWindowResized)
        this.onWindowResized()
    }.bind(this))
  },
  
  setCaption: function(caption){
    $('caption').update(caption);
  },
  
  initResize: function(){
    this.addEventListener("resize", "mousedown");
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
    if (this.onResize)
      this.onResize(event.screenY - window.nativeWindow.y)
  },
  
  nativeWindowDimensions: function(){
    return ["x", "y", "height", "width"].inject({}, function(memo, property){
      memo[property] = window.nativeWindow[property];
      return memo;
    })
  }
}
