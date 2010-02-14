Twump.View = {}

Twump.View.PlayerWindow = Class.create();
Twump.View.PlayerWindow.prototype = {
  initialize: function(){
    document.body.onmousedown = function() { window.nativeWindow.startMove(); } 
    this.addEventListeners("click", 
      ["close", "previous", "next", "pause", "stop", "play", "openFolder", "shuffle"]
     );
  },
  
  displayPlayProgress: function(data){
    $('playing').update(data.file);
    $('progress').update("" + data.position + " / " + data.length)
  },
  
  clearPlayProgress: function(){
    $('playing').update();
    $('progress').update()
  },
  
  onClose: function(){
    close();
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
  }
}
