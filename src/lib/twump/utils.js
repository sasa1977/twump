Twump.Utils = {}
Twump.Utils.DelayExecute = Class.create()
Twump.Utils.DelayExecute.prototype = {
  initialize: function(delay){
    this.delay = delay || 5000;
    this.currentStep = 0;
  },

  schedule: function(callback){
    var currentStep = this.currentStep++;
    setTimeout(function(){this.execute(currentStep, callback)}.bind(this), this.delay)
  },

  execute: function(currentStep, callback){
    if (!this.cancelled(currentStep))
      callback();
  },

  cancelled: function(currentStep) {
    return this.cancelledAt && this.cancelledAt >= currentStep;
  },

  cancel: function(){
    this.cancelledAt = this.currentStep++;
  }
}