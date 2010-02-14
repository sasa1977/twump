Twump.View = {}

Twump.View.PlayerWindow = Class.create();
Twump.View.PlayerWindow.prototype = {
  initialize: function(){
    document.body.onmousedown = function() { window.nativeWindow.startMove(); } 
    $('close').addEventListener("click", function() { close(); });
  },
  
  displayPlayProgress: function(data){
    air.trace(data.position);
  }
}
