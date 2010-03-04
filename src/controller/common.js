Twump.Controller.Common = {
  subscribeToViewEvents: function(view, events){
    events.each(function(event){
      var fullName = "on" + event.capitalizeEachWord();
      if (this[fullName])
        view[fullName] = this[fullName].bind(this);
    }.bind(this))
  }
}
