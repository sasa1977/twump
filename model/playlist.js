Twump.Model = {}
Twump.Model.Playlist = Class.create();
Twump.Model.Playlist.prototype = {
  initialize: function(list){
    this.list = list || [];
  },
  
  get: function(index){return this.list[index]},
  
}
