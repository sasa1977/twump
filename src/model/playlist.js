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
    
    if (this.repeats() && this.currentFile() == this.last())
      return this.first();
      
    return this.next();
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


Twump.Model.Playlist.deserialize = function(data){
  var playlist = new Twump.Model.Playlist();
  
  var files = $A(data).map(function(fileData){
    return new Twump.Model.File(fileData)
  });
  
  playlist.adjustAndSetFiles(files);
  
  return playlist;
}
