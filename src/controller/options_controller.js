Twump.Controller.Options = Class.define(
  Twump.Controller.Common,
  {
    initialize: function(options){
      Object.extend(this, options);
    
      this.subscribeToViewEvents(this.optionsWindow, ["testLastFmClick", "applyLastFm"]);
    
      this.optionsWindow.setLastFmData(this.playerController.lastFmLoginData());
    },
  
    onTestLastFmClick: function(){
      var lastFm = new LastFm({login: $('login').value, password: $('password').value});
      setTimeout(function(){
        if (lastFm.connected())
          alert('ok');
        else
          alert('failed');
      }.bind(this), 10000)
    },
  
    onApplyLastFm: function(loginData){
      this.playerController.setLastFmLogin(loginData);
    }
  }
)
