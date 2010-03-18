Twump.SliderBase = {
  initialize: function(bar, options){
    Object.extend(this, options || {})
  
    this.bar = $(bar);
    this.drawSlider(0)
    this.bar.addEventListener('click', this.onSliderClick.bind(this), false);
    this.slider().addEventListener('mousedown', this.onStartSlide.bind(this), false);
  },
  
  max: 0, value: 0, position: 0,
  
  refresh: function(){
    this.setValue(this.value);
  },
  
  setMaximum: function(max){
    this.max = Math.max(0,max);
    this.refresh();
  },
  
  getMaximum: function(){return this.max || 0},
  getValue: function(){return this.value || 0},
  
  onStartSlide: function(event){
    this.sliderDrag = this.onSliderDrag.bind(this);
    document.addEventListener('mousemove', this.sliderDrag, false);
    
    this.stopSliderDrag = this.onStopSliderDrag.bind(this);
    document.addEventListener('mouseup', this.stopSliderDrag, false);
    
    Event.stop(event)
  },
  
  onSliderClick: function(event){
    this.setValueFromCoordinate(event)
    this.fireChange();
  },
  
  onSliderDrag: function(event){
    this.setValueFromCoordinate(event);
    this.fireChange();
  },
  
  setValueFromCoordinate: function(coordinate){
    if (!this.max) return 0;
    this.setValue(this.coordinateToValue(this.normalizeCoordinate(coordinate)))
  },
  
  onStopSliderDrag: function(){
    document.removeEventListener('mousemove', this.sliderDrag, false);
    document.removeEventListener('mouseup', this.stopSliderDrag, false);
  },

  slider: function(){
    if (!this.sliderElement) {
      this.sliderElement = document.createElement('div');
      this.sliderElement.style.backgroundColor = "lightblue";
      document.body.appendChild(this.sliderElement);
      Position.absolutize(this.sliderElement);
      this.sliderElement = $(this.sliderElement);
    }
  
    return this.sliderElement;
  },
  
  setValue: function(value){
    if (!this.max) return;

    this.value = Math.max(0, Math.min(value, this.max - 1));
    this.drawSlider(this.computeCoordinates(this.value));
  },
  
  fireChange: function(){
    if (this.onChange)
      this.onChange(this);
  }
}


Twump.VerticalSlider = Class.create();
Object.extend(Twump.VerticalSlider.prototype, Twump.SliderBase);
Object.extend(Twump.VerticalSlider.prototype, {
  sliderHeight: 30,
  
  setSliderDimensions: function(){
    
  },

  drawSlider: function(pos){
    var barPos = Position.cumulativeOffset(this.bar)
  
    this.slider().style.top = (barPos[1] + pos).toString() + "px";
    this.slider().style.left = barPos[0];
    this.slider().style.height = this.sliderHeight.toString() + "px"
    this.slider().style.width = this.bar.offsetWidth.toString() + "px"
  },
  
  normalizeCoordinate: function(coordinate){
    return Math.max(0,Math.min(coordinate.clientY - Position.cumulativeOffset(this.bar)[1], this.bar.offsetHeight));
  },

  computeCoordinates: function(value){
    return Math.round(value * (this.bar.offsetHeight - this.sliderHeight) / (this.max - 1))
  },

  coordinateToValue: function(pos){
    if (!this.max) return 0;
  
    return Math.round((this.max - 1) * pos / this.bar.offsetHeight);
  }
});


Twump.HorizontalSlider = Class.create();
Object.extend(Twump.HorizontalSlider.prototype, Twump.SliderBase);
Object.extend(Twump.HorizontalSlider.prototype, {
  sliderWidth: 30,
  
  setSliderDimensions: function(){
    
  },

  drawSlider: function(pos){
    var barPos = Position.cumulativeOffset(this.bar)
  
    this.slider().style.left = (barPos[0] + pos).toString() + "px";
    this.slider().style.top = barPos[1];
    this.slider().style.height = this.bar.offsetHeight,toString() + "px"
    this.slider().style.width = this.sliderWidth.toString() + "px"
  },
  
  normalizeCoordinate: function(coordinate){
    return Math.max(0,Math.min(coordinate.clientX - Position.cumulativeOffset(this.bar)[0], this.bar.offsetWidth));
  },

  computeCoordinates: function(value){
    return Math.round(value * (this.bar.offsetWidth - this.sliderWidth) / (this.max - 1))
  },

  coordinateToValue: function(pos){
    if (!this.max) return 0;
  
    return Math.round((this.max - 1) * pos / this.bar.offsetWidth);
  }
});
