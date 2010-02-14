Twump.Model = {}
Twump.Model.Playlist = Class.create();
Twump.Model.Playlist.prototype = {
  initialize: function(list){
    this.list = $A(list || []);
  },
  
  get: function(index){return this.list[index]},
  length: function(){return this.list.length},
  
  shuffle: function(){
    this.list = this.list.shuffle();
  },
  
  deleteAt: function(index){
    this.list.splice(index, 1);
  }
}
