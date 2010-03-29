Twump.Model.Playlist = Class.create();

Object.extend(Twump.Model.Playlist.prototype, Twump.Model.Songlist.prototype);

Object.extend(Twump.Model.Playlist.prototype, {
  currentFile: function(){
    return this.current;
  },
  
  setCurrentFile: function(file){
    this.current = file;
  },
  
  currentIndex: function(){
    if (!this.current) return 0;
    
    return this.indexOf(this.current) || 0;
  },
  
  setCurrentIndex: function(index){
    this.setCurrentFile(this.itemAt(index))
  },
  
  next: function(){
    if (!this.currentFile()) return;
    return this.fileAt(this.indexOf(this.currentFile()) + 1);
  },
  
  nextPlaying: function(){
    if (!this.currentFile()) return;
    
    if (this.inRepeatPattern())
      return this.nextFromRepeatPattern();
    
    var result = {file: this.next()};
    if (this.repeats() && this.currentFile() == this.last()){
      if (this.shuffles()) {
        this.shuffle();
        result.reshuffled = true;
      }
      
      result.file = this.first();
      result.repeated = true;
    }
    
    return result;
  },
  
  repeatPatternMap: {},
  
  repeatPattern: function(){
    return Object.keys(this.repeatPatternMap).inject([], function(memo, id){
      if (this.repeatPatternMap[id] && this.file(id))
        memo.push(this.file(id));
        
      return memo;
    }.bind(this))
  },
  
  setRepeatPattern: function(files, reshuffle){
    this.repeatPatternMap = (files || []).inject({}, function(memo, file){
      memo[file.id] = true;
      return memo;
    })

    this.reshuffleRepeatPattern = reshuffle;
  },
  
  inRepeatPattern: function(){
    return this.currentFile() && this.repeatPatternMap[this.currentFile().id];
  },
  
  nextFromRepeatPattern: function(){
    if (!this.inRepeatPattern() || !this.currentFile()) return null;
    
    var nextIndex = this.length(), firstIndex = this.length();
    
    Object.keys(this.repeatPatternMap).each(function(id){
      if (!this.repeatPatternMap[id] || !this.file(id)) {
        this.repeatPatternMap[id] = null;
        return;
      }
      
      var fileIndex = this.idToIndex(id)
      firstIndex = Math.min(firstIndex, fileIndex);
      
      if (fileIndex > this.currentIndex() && fileIndex < nextIndex)
        nextIndex = fileIndex;
    }.bind(this));
    
    if (nextIndex >= this.length())
      nextIndex = firstIndex;

    var result = {file: this.fileAt(nextIndex)}
    if (nextIndex < this.currentIndex() && this.reshuffleRepeatPattern) {
      this.shuffleFiles(this.repeatPattern());
      result.reshuffled = true;
      result.file = this.fileAt(firstIndex);
    }
    
    return result;
  },
  
  previousFromRepeatPattern: function(){
    if (!this.inRepeatPattern() || !this.currentFile()) return null;
    
    var previousIndex = -1, lastIndex = -1;
    
    Object.keys(this.repeatPatternMap).each(function(id){
      if (!this.repeatPatternMap[id] || !this.include(this.file(id))) {
        this.repeatPatternMap[id] = null;
        return;
      }
      
      var fileIndex = this.idToIndex(id)
      lastIndex = Math.max(lastIndex, fileIndex);
      
      if (fileIndex < this.currentIndex() && fileIndex > previousIndex)
        previousIndex = fileIndex;
    }.bind(this));
    
    if (previousIndex < 0)
      previousIndex = lastIndex;

    return this.fileAt(previousIndex);
  },
    
  previous: function(){
    if (!this.currentFile()) return;
    return this.fileAt(this.indexOf(this.currentFile()) - 1);
  },
  
  previousPlaying: function(){
    if (!this.currentFile()) return;
    
    if (this.inRepeatPattern())
      return this.previousFromRepeatPattern();
    
    if (this.repeats() && this.currentFile() == this.first())
      return this.last();
    
    return this.previous();
  },
  
  repeats: function(){
    return (this.repeatMode != null && this.repeatMode != "no");
  },
  
  shuffles: function(){
    return this.repeatMode == "reshuffle";
  },
  
  remove: function(files){
    if (!this.currentFile()) return;
    
    var newFile = this.deleteFiles(files, this.currentFile());

    if (newFile != this.currentFile()){ // in this case, we removed currently selected file
      this.setCurrentFile(newFile);
      return {removedCurrent: true};
    }
    
    return {removedCurrent: false};
  }
});

Object.wrap(Twump.Model.Playlist.prototype, "shuffle", function(from){
  this.shuffleOriginal(from);
  this.setRepeatPattern([]);
})


Twump.Model.Playlist.deserialize = function(data){
  var playlist = new Twump.Model.Playlist();
  
  var files = $A(data).map(function(fileData){
    return new Twump.Model.File(fileData)
  });
  
  playlist.adjustAndSetFiles(files);
  
  return playlist;
}
