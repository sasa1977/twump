Twump.View = {}

Twump.View.PlayerWindow = Class.create();
Twump.View.PlayerWindow.prototype = {
  initialize: function(){
    document.body.onmousedown = function() { window.nativeWindow.startMove(); } 
    $('close').addEventListener("click", function() { close(); });
  },
  
  displayPlayProgress: function(data){
    $('playing').update(data.file);
    $('progress').update("" + data.position + " / " + data.length)
  }
}
