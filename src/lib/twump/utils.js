Twump.Utils = {}
Twump.Utils.DelayExecute = Class.create()
Twump.Utils.DelayExecute.prototype = {
  initialize: function(delay){
    this.delay = delay || 5000;
    this.delayedExecutors = []
  },

  schedule: function(callback){
    var step = this.delayedExecutors.length;
    
    this.delayedExecutors.push(
      setTimeout(function(){this.execute(step, callback)}.bind(this), this.delay)
    )
  },

  execute: function(step, callback){
    if (!this.cancelled(step))
      callback();
      
    if (this.lastStep(step)) {
      this.currentStep = 0;
      this.delayedExecutors = [];
    }
  },

  cancelled: function(step) {
    return this.cancelledAt && this.cancelledAt >= step;
  },

  cancel: function(){
    this.cancelledAt = this.delayedExecutors.length - 1;
    
    for (var i = 0, length = this.delayedExecutors.length;i < length;i++){
      var timeout = this.delayedExecutors[i];
      if (timeout != null)
        clearTimeout(timeout);
    }
  },
  
  lastStep: function(step){
    return step == this.delayedExecutors.length - 1;
  }
}



Twump.Utils.scheduleInChunks = function(jobs, options){
  options = options || {}
  jobs.each(function(job, index){
    setTimeout(function(){job()}, (index + 1) * (options.delay || 100));
  })
}