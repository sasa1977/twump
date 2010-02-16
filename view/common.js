Twump.View.Common = {
  addEventListener: function(element, event){
    $(element).addEventListener(event, function(){
      this.invokeEvent("on" + element.capitalizeEachWord())
    }.bind(this), false);
  },
  
  addEventListeners: function(event, elements){
    elements.each(function(element){
      this.addEventListener(element, event)
    }.bind(this))
  },
  
  invokeEvent: function(event){
    if (this[event])
      this[event]();
  },
  
  insertHeader: function(parentId){
    var html = '<table cellpadding="0" cellspacing="0" border="0" width="100%">' +
      '<tr class="header" id="header">' +
        '<td width="*">&nbsp;</td>' +
        '<td width="10px">' +
          '<div id="close">' +
            'close' +
          '</div>' +
        '</td>' +
      '</tr>' +
    '</table>';
    
    new Insertion.Top(parentId, html);
    
    this.addEventListener("close", "click");
    this.onClose = function(){
      if (this.onWindowClosing)
        this.onWindowClosing();
      close();
    }
    
    this.addEventListener("header", "mousedown");
    this.onHeader = function(){
      window.nativeWindow.startMove();
    }
  }
}
