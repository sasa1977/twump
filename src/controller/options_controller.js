Twump.Controller.Options = Class.create();

Object.extend(Twump.Controller.Options.prototype, Twump.Controller.Common);

Object.extend(Twump.Controller.Options.prototype, {
  initialize: function(options){
    Object.extend(this, options);
    
    this.subscribeToViewEvents(this.editorWindow, ["testLastFmClick"]);
  },
  
  onTestLastFmClick: function(){
    var lastFm = new LastFm({login: $('login').value, password: $('password').value});
    setTimeout(function(){
      if (lastFm.connected())
        alert('ok');
      else
        alert('failed');
    }.bind(this), 10000)
  }
})
