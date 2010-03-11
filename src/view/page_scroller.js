Twump.View.PageScroller = Class.create();

Object.extend(Twump.View.PageScroller.prototype, Twump.View.Common);

Object.extend(Twump.View.PageScroller.prototype, {
  initialize: function(id){
    this.pageSlider = this.initSlider(id, {min: 0, max: 0, direction: 'vertical',
      onchange: this.onPageSliderChange.bind(this)
    })
  },
  
  setPage: function(page, max){
    this.ignorePageChange = true;
    
    this.pageSlider.setMinimum(0);
    this.setMaximum(max);
    this.pageSlider.setValue(this.pageSlider.getMaximum() - page);
    this.notifyPageChange();
    
    this.ignorePageChange = false;
  },
  
  onPageSliderChange: function(event){
    if (!this.ignorePageChange)
      this.notifyPageChange()
  },
  
  notifyPageChange: function(){
    if (this.onPageChange) {
      this.onPageChange(this.pageSlider.getMaximum() - this.pageSlider.getValue());
    }
  },
  
  incPage: function(inc){
    this.setPage(this.getPage() + inc, this.pageSlider.getMaximum())
  },
  
  getPage: function(){
    return this.pageSlider.getMaximum() - this.pageSlider.getValue();
  },
  
  setMaximum: function(max){
    this.pageSlider.setMaximum(max);
  }
})
