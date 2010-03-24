Twump.View.OptionsWindow = Class.create();

Object.extend(Twump.View.OptionsWindow.prototype, Twump.View.Common);
Object.extend(Twump.View.OptionsWindow.prototype, {
  initialize: function(){
    this.insertHeader('editor');
    this.addEventListeners('click', ['testLastFm']);
  }
});
