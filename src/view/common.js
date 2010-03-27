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
  },
  
  openContextMenu: function(event, items, data){
    var contextMenu = $('contextMenu');
    if (!contextMenu) {
      contextMenu = $(document.createElement('div'));
      contextMenu.id = 'contextMenu';
      contextMenu.addClassName('contextMenu')
      document.body.appendChild(contextMenu);
    }
    
    contextMenu.update(this.contextMenuTemplate.process({items: items}))
    
    Position.absolutize(contextMenu);
    contextMenu.style.top = event.clientY.toString() + "px";
    contextMenu.style.left = event.clientX.toString() + "px";
    contextMenu.show();
    
    items.each(function(item){
      $(item.id).addEventListener('click', function(){item.onClick(data)}.bind(this))
    })
  },
  
  closeContextMenu: function(){
    var contextMenu = $('contextMenu');
    if (!contextMenu) return;
    
    contextMenu.hide();
    contextMenu.update('')
  },
  
  contextMenuTemplate: TrimPath.parseTemplate(" \
    {for item in items} \
      <div id='${item.id}' class='contextMenuItem'> \
        ${item.title} \
      </div> \
    {/for} \
  ")
}
