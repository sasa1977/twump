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
    this.onCloseClick = function(){
      if (this.onWindowClosing)
        this.onWindowClosing();
      close();
    }
    
    this.addEventListener("header", "mousedown");
    this.onHeaderMousedown = function(){
      window.nativeWindow.startMove();
    }
  }
}
