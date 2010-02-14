Twump.Model = {}
Twump.Model.Playlist = Class.create();
Twump.Model.Playlist.prototype = {
  initialize: function(files){
    this.files = $A(files || []);
  },
  
  get: function(index){return this.files[index]},
  length: function(){return this.files.length},
  empty: function(){return this.files.length == 0},
  
  shuffle: function(){
    this.files = this.files.shuffle();
  },
  
  deleteAt: function(index){
    this.files.splice(index, 1);
  },
  
  insertAt: function(at, files){
    this.files = this.files.insertArrayAt(at, files);
  }
}
