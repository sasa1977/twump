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
    
    this.addEventListener("header", "mousedown");
    this.onHeaderMousedown = function(){
      window.nativeWindow.startMove();
    }
  },
  
  setCaption: function(caption){
    $('caption').update(caption);
  },
  
  initSlider: function(id, options){
    var slider = new Slider($(id), $(id + 'Input'), options.direction);
    
    slider.onchange = options.onchange;
    slider.setMinimum(options.min);
    slider.setMaximum(options.max);
    
    return slider;
  }
}
