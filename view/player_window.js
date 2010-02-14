Twump.View = {}

Twump.View.PlayerWindow = Class.create();
Twump.View.PlayerWindow.prototype = {
  initialize: function(){
    document.body.onmousedown = function() { window.nativeWindow.startMove(); } 
    this.addEventListeners("click", 
      ["close", "previous", "next", "pause", "stop", "play", "openFolder", "shuffle", "delete"]
     );
  },
  
  displayPlayProgress: function(data){
    $('playing').update(data.file);
    $('playlistPos').update("Playing file: " + data.currentIndex + " of " + data.playlistLength)
    $('progress').update("" + data.position + " / " + data.length)
  },
  
  clearPlayProgress: function(){
    $('playing').update();
    $('playlistPos').update();
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
