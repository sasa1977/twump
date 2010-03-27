Twump.Model.Songlist = Class.create();
Twump.Model.Songlist.prototype = {
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
  
  rescanFilesIndex: function(){
    this.filesIndex = {}
    this.files.each(function(file){
      this.filesIndex[file.id] = file
    }.bind(this))
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
  
  last: function(){
    return this.files.last();
  },
  
  first: function(){
    return this.files.first();
  },
  
  length: function(){return this.files.length},
  empty: function(){return this.files.length == 0},
  
  shuffle: function(from){
    this.setFiles(this.files.shuffle(from))
  },
  
  clear: function(){
    this.setFiles([])
  },
  
  deleteFiles: function(files, currentFile){
    var currentIndex = this.indexOf(currentFile), newIndex = currentIndex;
    
    files.each(function(file){
      var index = this.indexOf(file);
      
      this.files[index] = null;
      this.filesIndex[file.id] = null;
      
      if (index <= currentIndex)
        newIndex--;
    }.bind(this));
    
    this.files = this.files.compact();
    this.reindexPositions();
    
    var result = this.fileAt(newIndex);
    if (result != currentFile) // in this case, original file was removed
      result = this.fileAt(newIndex + 1); // so I return the next one
    
    if (!result)
      result = this.files.last();
    
    return result;
  },
  
  insertAt: function(at, files){
    this.setFiles(this.files.insertArrayAt(at, files).compact());
  },
  
  insertPathsAt: function(item, paths){
    if (!item)
      this.addPaths(paths)
    else      
      this.insertAt(this.indexOf(item), this.filesFromPaths(paths));
  },
  
  addPaths: function(paths){
    this.insertAt(this.length(), this.filesFromPaths(paths));
  },
  
  search: function(filter){
    var regex = filter.split(/\s+/).inject("", function(memo, part){
      return memo + "(?=.*" + part.escapeForRegex() + ".*)"
    })
  
    regex = new RegExp(regex, "i");
    
    var result = new Twump.Model.Songlist();
    
    var files = (this.files.inject([],function(memo, file){
      if (file.match(regex))
        memo.push(file);
      
      return memo;
    }));
    
    result.setFiles(files);
    result.rescanFilesIndex();
    
    return result;
  },
  
  moveBefore: function(files, before){
    var position = this.length();
    
    if (before) position = this.indexOf(before);
    
    var filesToMove = files.inject([], function(memo, file){
      memo.push(file);
      this.files[this.indexOf(file)] = null;
      
      return memo;
    }.bind(this))
    
    this.insertAt(position, filesToMove);
  },
  
  pageAround: function(options){
    if (this.empty()) return 0;
    
    var before = parseInt(options.range/2);
  
    var start = Math.max(this.indexOf(options.file) - before, 0);
    var end = Math.min(start + options.range, this.length());
    start = Math.max(end - options.range, 0);
    
    return start;
  },
  
  page: function(options){
    if (this.empty()) return 0;
    
    var start = Math.max(Math.min(options.start, this.length() - 1), 0);
    var end = Math.min(start + options.range, this.length()); 
    
    return start;
  },
  
  items: function(bounds){
    var result = []
    for (var index = bounds.start;index < bounds.end;index++) {
      result.push(this.fileAt(index));
    }
    return result;
  }
};
