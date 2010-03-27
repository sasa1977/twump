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
    
    var result = {file: this.next()};
    
    if (this.hasRepeatPattern()) {
      result.reshuffled = this.willReshuffleRepeatPattern();
      result.file = this.nextFromRepeatPattern();
    }
    else if (this.repeats() && this.currentFile() == this.last()){
      if (this.shuffles()) {
        this.shuffle();
        result.reshuffled = true;
      }
      
      result.file = this.first();
      result.repeated = true;
    }
    
    return result;
  },
  
  setRepeatPattern: function(files, reshuffle){
    this.repeatPattern = files.clone();
    this.repeatIndex = -1;
    this.reshuffleRepeatPattern = reshuffle;
  },
  
  willReshuffleRepeatPattern: function(){
    return this.hasRepeatPattern() && this.reshuffleRepeatPattern &&
     (this.repeatIndex >= this.repeatPattern.length - 1);
  },
  
  nextFromRepeatPattern: function(){
    this.cleanupRepeatPattern();
    if (!this.hasRepeatPattern()) return null;
    
    if (this.willReshuffleRepeatPattern()) {
      this.shuffleFiles(this.repeatPattern);
      this.sortRepeatPattern();
    }
    
    this.repeatIndex = (this.repeatIndex + 1) % this.repeatPattern.length;
    return this.repeatPattern[this.repeatIndex];
  },
  
  hasRepeatPattern: function(){
    return this.repeatPattern && this.repeatPattern.length > 0
  },
  
  cleanupRepeatPattern: function(){
    if (!this.hasRepeatPattern()) return;
    
    this.repeatPattern.each(function(file, index){
      if (!this.include(file))
        this.repeatPattern[index] = null;
    }.bind(this))
    
    this.repeatPattern = this.repeatPattern.compact();
    this.sortRepeatPattern();
  },
  
  sortRepeatPattern: function(){
    if (!this.hasRepeatPattern()) return;
    
    this.repeatPattern = this.repeatPattern.sortBy(function(file){
      return this.indexOf(file)
    }.bind(this))
  },
  
  previous: function(){
    if (!this.currentFile()) return;
    return this.fileAt(this.indexOf(this.currentFile()) - 1);
  },
  
  previousPlaying: function(){
    if (!this.currentFile()) return;
    
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
