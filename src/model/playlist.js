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
  
  adjustAndSetFiles: function(files){
    this.filesIndex = {}
  
    files.each(function(file){
      file.id = this.generateId()
      this.filesIndex[file.id] = file;
    }.bind(this));
    
    this.setFiles(files);
  },
  
  setFiles: function(files){
    this.files = $A(files);
    this.reindexPositions();
  },
  
  filesFromPaths: function(paths){
    return $A(paths.map(function(path){
      var newFile = new Twump.Model.File({
        id: this.generateId(), path: path
      });
      
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
  
  idToIndex: function(id){
    return this.indexOf(this.file(id))
  },
  
  length: function(){return this.files.length},
  empty: function(){return this.files.length == 0},
  
  shuffle: function(from){
    this.setFiles(this.files.shuffle(from))
  },
  
  clear: function(){
    this.setFiles([])
  },
  
  deleteFiles: function(files, currentIndex){
    var newIndex = currentIndex;
    
    files.each(function(file){
      var index = this.indexOf(file);
      
      this.files[index] = null;
      this.filesIndex[file.id] = null;
      
      if (index <= currentIndex)
        newIndex--;
    }.bind(this));
    
    this.files = this.files.compact();
    this.reindexPositions();
    
    return newIndex;
  },
  
  insertAt: function(at, files){
    this.setFiles(this.files.insertArrayAt(at, files).compact());
  },
  
  insertPathsAt: function(at, paths){
    this.insertAt(at, this.filesFromPaths(paths));
  },
  
  search: function(filter){
    var regex = filter.split(/\s+/).inject("", function(memo, part){
      return memo + "(?=.*" + part.escapeForRegex() + ".*)"
    })
  
    regex = new RegExp(regex, "i");
    
    return new Twump.Model.Playlist(this.files.inject([],function(memo, file){
      if (file.match(regex))
        memo.push(file.path);
      
      return memo;
    }));
  },
  
  moveBefore: function(files, before, currentFile){  
    var position = this.indexOf(before);
    if (!position) return;
    
    var filesToMove = files.inject([], function(memo, file){
      memo.push(file);
      this.files[this.indexOf(file)] = null;
      
      return memo;
    }.bind(this))

    this.insertAt(position, filesToMove);
    
    return this.indexOf(currentFile);
  },
  
  boundsAround: function(options){
    if (this.empty()) return {start: 0, end: 0};
  
    var start = Math.max(this.indexOf(options.file) - options.range, 0);
    var end = Math.min(start + 2 * options.range, this.length());
    start = Math.max(end - 2 * options.range, 0);
    
    return {start: start, end: end};
  },
  
  boundsFrom: function(options){
    if (this.empty()) return {start: 0, end: 0};
    
    var start = Math.max(Math.min(options.start, this.length()), 0);
    var end = Math.min(start + 2 * options.range, this.length()); 
    start = Math.max(end - 2 * options.range, 0);
    
    return {start: start, end: end};
  },
  
  items: function(bounds){
    var result = []
    for (var index = bounds.start;index < bounds.end;index++) {
      result.push(this.fileAt(index));
    }
    return result;
  }
};

Twump.Model.Playlist.deserialize = function(data){
  var playlist = new Twump.Model.Playlist();
  
  var files = $A(data).map(function(fileData){
    return new Twump.Model.File(fileData)
  });
  
  playlist.adjustAndSetFiles(files);
  
  return playlist;
}
