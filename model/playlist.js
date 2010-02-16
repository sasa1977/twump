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
  
  moveAfterCurrent: function(items, currentIndex){
    var searchers = items.map(function(item){
      return new RegExp("^" + item + "$")
    });
    
    var filesToMove = [];
    var offset = 0;
    
    for (var i=0, l=this.files.length;i < l;i++){
      var match = this.matchSearchers(this.files[i], searchers);
      if (match >= 0){
        searchers.splice(match, 1);
        if (i != currentIndex) {
          filesToMove.push(this.files[i]);
          this.files[i] = null;
          
          if (i < currentIndex)
            offset++;
        }
      }
    }
    
    if (filesToMove.length == 0)
      return currentIndex;
      
    this.files = this.files.compact();
    var newCurrentIndex = currentIndex - offset;
    this.insertAt(newCurrentIndex + 1, filesToMove);
    
    return newCurrentIndex;
  },
  
  matchSearchers: function(file, searchers){
    for (var i=0, l=searchers.length;i < l;i++)
      if (file.match(searchers[i]))
        return i;
        
    return -1;
  }
}
