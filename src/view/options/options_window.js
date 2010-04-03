Twump.View.OptionsWindow = Class.define(
  Twump.View.Common,
  {
    initialize: function(){
      this.insertHeader('editor');
      this.addEventListeners('click', ['testLastFm', 'applyLastFm']);
    },
  
    setLastFmData: function(data){
      data = data || {}
      $('login').value = data.login || "";
      $('password').value = data.password || "";
    },
  
    onApplyLastFmClick: function(){
      this.onApplyLastFm({login: $('login').value, password: $('password').value});
    }
  }
);
