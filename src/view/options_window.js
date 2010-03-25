Twump.View.OptionsWindow = Class.create();

Object.extend(Twump.View.OptionsWindow.prototype, Twump.View.Common);
Object.extend(Twump.View.OptionsWindow.prototype, {
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
});
