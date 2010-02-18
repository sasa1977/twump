Twump.Model.Playlist = Class.create();
Twump.Model.Playlist.prototype = {
  initialize: function(paths){
    this.lastId = 0;
    this.filesIndex = {}
    this.setFiles(this.filesFromPaths(paths || []));
  },
  
  generateId: function(){
    return this.lastId++;
  },
  
  reindexPositions: function(){
    this.positions = this.files.inject({}, function(memo, file, index){
      memo[file.id] = index;
      return memo;
    })
  },
  
  setFiles: function(files){
    this.files = files;
    this.reindexPositions();
  },
  
  filesFromPaths: function(paths){
    return $A(paths.map(function(path){
      var newFile = new Twump.Model.File({id: this.generateId(), path: path});
      this.filesIndex[newFile.id] = newFile;
      
      return newFile;
    }.bind(this)))
  },
  
  fileAt: function(position){
    return this.files[position];
  },
  
  file: function(id){
    return this.filesIndex[id];
  },
  
  paths: function(){
    return $A(this.files.map(function(file){return file.path}));
  },
  
  indexOf: function(file){
    return this.positions[file.id];
  },
  
  length: function(){return this.files.length},
  empty: function(){return this.files.length == 0},
  
  shuffle: function(from){
    this.setFiles(this.files.shuffle(from))
  },
  
  clear: function(){
    this.setFiles([])
  },
  
  deleteAt: function(index){
    var removed = this.files.splice(index, 1);
    if (!removed) return;
    
    this.filesIndex[removed.id] = null;
    this.positions[removed.id] = null;
  },
  
  insertAt: function(at, files){
    this.setFiles(this.files.insertArrayAt(at, files).compact());
  },
  
  insertPathsAt: function(at, paths){
    this.insertAt(at, this.filesFromPaths(paths));
  },
  
  search: function(filter){
    var regex = new RegExp(filter, "i");
    return this.files.inject([],function(memo, file){
      if (file.path.match(regex))
        memo.push(file);
      
      return memo;
    })
  },
  
  moveAfter: function(items, id, currentFile){  
    var position = this.indexOf({id: id});
  
    var filesToMove = items.inject([], function(memo, id){
      memo.push(this.file(id));
      this.files[this.indexOf({id: id})] = null;
      
      return memo;
    }.bind(this))

    this.insertAt(position, filesToMove);
    
    return this.indexOf(currentFile);
  }
}
