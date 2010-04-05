Twump.Model.Playlist = Class.define(
  Twump.Model.Songlist.prototype,
  {
    currentSong: function(){
      return this.current;
    },
  
    setCurrentSong: function(song){
      this.current = song;
    },
  
    currentIndex: function(){
      if (!this.current) return 0;
    
      return this.indexOf(this.current) || 0;
    },
  
    setCurrentIndex: function(index){
      this.setCurrentSong(this.itemAt(index))
    },
  
    next: function(){
      if (!this.currentSong()) return;
      return this.songAt(this.indexOf(this.currentSong()) + 1);
    },
  
    nextPlaying: function(){
      if (!this.currentSong()) return;
    
      if (this.inRepeatPattern())
        return this.nextFromRepeatPattern();
    
      var result = {song: this.next()};
      if (this.repeats() && this.currentSong() == this.last()){
        if (this.shuffles()) {
          this.shuffle();
          result.reshuffled = true;
        }
      
        result.song = this.first();
        result.repeated = true;
      }
    
      return result;
    },
  
    repeatPatternMap: {},
  
    repeatPattern: function(){
      return Object.keys(this.repeatPatternMap).inject([], function(memo, id){
        if (this.repeatPatternMap[id] && this.song(id))
          memo.push(this.song(id));
        
        return memo;
      }.bind(this))
    },
  
    setRepeatPattern: function(songs, reshuffle){
      this.repeatPatternMap = (songs || []).inject({}, function(memo, song){
        memo[song.id] = true;
        return memo;
      })

      this.reshuffleRepeatPattern = reshuffle;
    },
  
    inRepeatPattern: function(){
      return this.currentSong() && this.repeatPatternMap[this.currentSong().id];
    },
  
    nextFromRepeatPattern: function(){
      if (!this.inRepeatPattern() || !this.currentSong()) return null;
    
      var nextIndex = this.length(), firstIndex = this.length();
    
      Object.keys(this.repeatPatternMap).each(function(id){
        if (!this.repeatPatternMap[id] || !this.song(id)) {
          this.repeatPatternMap[id] = null;
          return;
        }
      
        var songIndex = this.idToIndex(id)
        firstIndex = Math.min(firstIndex, songIndex);
      
        if (songIndex > this.currentIndex() && songIndex < nextIndex)
          nextIndex = songIndex;
      }.bind(this));
    
      if (nextIndex >= this.length())
        nextIndex = firstIndex;

      var result = {song: this.songAt(nextIndex)}
      if (nextIndex < this.currentIndex() && this.reshuffleRepeatPattern) {
        this.shuffleSongs(this.repeatPattern());
        result.reshuffledRepeatPattern = true;
        result.song = this.songAt(firstIndex);
      }
    
      return result;
    },
  
    previousFromRepeatPattern: function(){
      if (!this.inRepeatPattern() || !this.currentSong()) return null;
    
      var previousIndex = -1, lastIndex = -1;
    
      Object.keys(this.repeatPatternMap).each(function(id){
        if (!this.repeatPatternMap[id] || !this.include(this.song(id))) {
          this.repeatPatternMap[id] = null;
          return;
        }
      
        var songIndex = this.idToIndex(id)
        lastIndex = Math.max(lastIndex, songIndex);
      
        if (songIndex < this.currentIndex() && songIndex > previousIndex)
          previousIndex = songIndex;
      }.bind(this));
    
      if (previousIndex < 0)
        previousIndex = lastIndex;

      return this.songAt(previousIndex);
    },
    
    previous: function(){
      if (!this.currentSong()) return;
      return this.songAt(this.indexOf(this.currentSong()) - 1);
    },
  
    previousPlaying: function(){
      if (!this.currentSong()) return;
    
      if (this.inRepeatPattern())
        return this.previousFromRepeatPattern();
    
      if (this.repeats() && this.currentSong() == this.first())
        return this.last();
    
      return this.previous();
    },
  
    repeats: function(){
      return (this.repeatMode != null && this.repeatMode != "no");
    },
  
    shuffles: function(){
      return this.repeatMode == "reshuffle";
    },
  
    remove: function(songs){
      if (!this.currentSong()) return;
    
      var newSong = this.removeSongs(songs, this.currentSong());

      if (newSong != this.currentSong()){ // in this case, we removed currently playing song
        this.setCurrentSong(newSong);
        return {removedCurrent: true};
      }
    
      return {removedCurrent: false};
    }
  }
);

Object.wrap(Twump.Model.Playlist.prototype, "shuffle", function(from){
  this.shuffleOriginal(from);
  this.setRepeatPattern([]);
})


Twump.Model.Playlist.deserialize = function(data){
  var playlist = new Twump.Model.Playlist();
  
  var songs = $A(data).map(function(songData){
    return new Twump.Model.Song(songData)
  });
  
  playlist.adjustAndSetSongs(songs);
  
  return playlist;
}
