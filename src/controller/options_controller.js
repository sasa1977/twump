Twump.Controller.Options = Class.create();

Object.extend(Twump.Controller.Options.prototype, Twump.Controller.Common);

Object.extend(Twump.Controller.Options.prototype, {
  initialize: function(options){
    Object.extend(this, options);
  }
})
