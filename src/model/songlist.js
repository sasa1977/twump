Twump.Model.Songlist = Class.create();
Twump.Model.Songlist.prototype = {
  initialize: function(paths){
    this.lastId = 0;
    this.songsIndex = {}
    this.setSongs(this.songsFromPaths(paths || []));
  },
  
  generateId: function(){
    return this.lastId++;
  },
  
  reindexPositions: function(){
    this.positions = this.songs.inject({}, function(memo, song, index){
      memo[song.id] = index;
      return memo;
    })
  },
  
  adjustAndSetSongs: function(songs){
    this.songsIndex = {}
  
    songs.each(function(song){
      song.id = this.generateId()
      this.songsIndex[song.id] = song;
    }.bind(this));
    
    this.setSongs(songs);
  },
  
  setSongs: function(songs){
    this.songs = $A(songs);
    this.reindexPositions();
  },
  
  rescanSongsIndex: function(){
    this.songsIndex = {}
    this.songs.each(function(song){
      this.songsIndex[song.id] = song
    }.bind(this))
  },
    
  songsFromPaths: function(paths){
    return $A(paths.map(function(path){
      var newSong = new Twump.Model.Song({
        id: this.generateId(), path: path
      });
      
      this.songsIndex[newSong.id] = newSong;
      
      return newSong;
    }.bind(this)))
  },
  
  songAt: function(position){
    return this.songs[position];
  },
  
  song: function(id){
    return this.songsIndex[id];
  },
  
  paths: function(){
    return $A(this.songs.map(function(song){return song.path}));
  },
  
  indexOf: function(song){
    return this.positions[song.id];
  },
  
  indicesOf: function(songs){
    return songs.map(function(song){
      return this.indexOf(song)
    }.bind(this))
  },
  
  idToIndex: function(id){
    return this.indexOf(this.song(id))
  },
  
  last: function(){
    return this.songs.last();
  },
  
  first: function(){
    return this.songs.first();
  },
  
  include: function(song){
    return (this.indexOf(song) != null);
  },
  
  length: function(){return this.songs.length},
  empty: function(){return this.songs.length == 0},
  
  shuffle: function(from){
    this.setSongs(this.songs.shuffle(from))
  },
  
  shuffleSongs: function(songs){
    this.setSongs(this.songs.shuffleItems(this.indicesOf(songs)));
  },
  
  clear: function(){
    this.setSongs([])
  },
  
  deleteSongs: function(songs, currentSong){
    var currentIndex = this.indexOf(currentSong), newIndex = currentIndex;
    
    songs.each(function(song){
      var index = this.indexOf(song);
      
      this.songs[index] = null;
      this.songsIndex[song.id] = null;
      
      if (index <= currentIndex)
        newIndex--;
    }.bind(this));
    
    this.songs = this.songs.compact();
    this.reindexPositions();
    
    var result = this.songAt(newIndex);
    if (result != currentSong) // in this case, currently playing was removed
      result = this.songAt(newIndex + 1); // so I return the next one
    
    if (!result)
      result = this.songs.last();
    
    return result;
  },
  
  insertAt: function(at, songs){
    this.setSongs(this.songs.insertArrayAt(at, songs).compact());
  },
  
  insertPathsAt: function(item, paths){
    if (!item)
      this.addPaths(paths)
    else      
      this.insertAt(this.indexOf(item), this.songsFromPaths(paths));
  },
  
  addPaths: function(paths){
    this.insertAt(this.length(), this.songsFromPaths(paths));
  },
  
  search: function(filter){
    var regex = filter.split(/\s+/).inject("", function(memo, part){
      return memo + "(?=.*" + part.escapeForRegex() + ".*)"
    })
  
    regex = new RegExp(regex, "i");
    
    var result = new Twump.Model.Songlist();
    
    var songs = (this.songs.inject([],function(memo, song){
      if (song.match(regex))
        memo.push(song);
      
      return memo;
    }));
    
    result.setSongs(songs);
    result.rescanSongsIndex();
    
    return result;
  },
  
  moveBefore: function(songs, before){
    var position = this.length();
    
    if (before) position = this.indexOf(before);
    
    var songsToMove = songs.inject([], function(memo, song){
      memo.push(song);
      this.songs[this.indexOf(song)] = null;
      
      return memo;
    }.bind(this))
    
    this.insertAt(position, songsToMove);
  },
  
  pageAround: function(options){
    if (this.empty()) return 0;
    
    var before = parseInt(options.range/2);
  
    var start = Math.max(this.indexOf(options.song) - before, 0);
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
      result.push(this.songAt(index));
    }
    return result;
  }
};
