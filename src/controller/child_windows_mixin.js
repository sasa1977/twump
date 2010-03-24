Twump.Controller.ChildWindowsMixin = {
  openedWindows: {},
  
  windowHandle: function(id){
    return this.openedWindows[id]
  },
  
  setWindowHandle: function(id, handle){
    this.openedWindows[id] = handle;
  },
  
  clearWindowHandle: function(id){
    this.setWindowHandle(id, null);
  },
  
  windowOpened: function(id){
    return this.windowHandle(id) != null;
  },
  
  childController: function(id){
    if (!this.windowOpened(id)) return;
    return this.windowHandle(id).window.controller;
  },
  
  openChildWindow: function(id, options){
    if (this.windowOpened(id)) return;
    this.setWindowHandle(id, Twump.Api.newWindow(options))
    this.windowHandle(id).window.nativeWindow.addEventListener('close', function(){
      this.clearWindowHandle(id)
    }.bind(this))
  },
  
  closeChildWindow: function(id){
    if (!this.windowOpened(id)) return;
    this.windowHandle(id).window.close();
    this.clearWindowHandle(id);
  },
  
  openOrCloseChildWindow: function(id, options){
    this.windowOpened(id) ? this.closeChildWindow(id) : this.openChildWindow(id, options);
  }
}