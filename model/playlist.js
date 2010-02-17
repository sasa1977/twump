Twump.Model = {}
Twump.Model.Playlist = Class.create();
Twump.Model.Playlist.prototype = {
  initialize: function(files){
    this.files = $A(files || []);
  },
  
  get: function(index){return this.files[index]},
  length: function(){return this.files.length},
  empty: function(){return this.files.length == 0},
  
  shuffle: function(from){
    this.files = this.files.shuffle(from);
  },
  
  clear: function(){
    this.files.clear();
  },
  
  deleteAt: function(index){
    this.files.splice(index, 1);
  },
  
  insertAt: function(at, files){
    this.files = this.files.insertArrayAt(at, files);
  },
  
  search: function(filter){
    var regex = new RegExp(filter, "i");
    return this.files.inject([],function(memo, file){
      if (file.match(regex))
        memo.push(file);
      
      return memo;
    })
  },
  
  moveAfter: function(items, index, currentIndex){
    var currentFile = this.files[currentIndex];
  
    var searchers = items.clone();
    
    for (var i=0, l=this.files.length;i < l;i++){
      var match = this.matchSearchers(this.files[i], searchers);
      if (match >= 0){
        searchers.splice(match, 1);
        this.files[i] = null;
        if (searchers.length == 0)
          break;
      }
    }
    
    this.insertAt(index, items);
    this.files = this.files.compact();
    
    for (var i=0, l=this.files.length;i < l;i++){
      if (this.files[i] == currentFile)
        return i;
    }
    return currentIndex;
  },
  
  matchSearchers: function(file, searchers){
    for (var i=0, l=searchers.length;i < l;i++)
      if (file == searchers[i])
        return i;
        
    return -1;
  }
}
