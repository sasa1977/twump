Twump.Repository = {
  playlistEncoder: function(file){
    for (var encoderName in Twump.Repository.Playlists) {
      var encoder = Twump.Repository.Playlists[encoderName];
      if (encoder.extensions.include(file.extension))
        return new encoder(file)
    }
  }
}

Twump.Repository.Playlists = {}

Twump.Repository.Playlists.M3u = Class.define({
  initialize: function(file){
    this.file = file;
  },
  
  save: function(playlist, options){
    Twump.Storage.writeUTF(this.file, this.encode(playlist, options));
  },
  
  load: function(){
    return this.decode(Twump.Storage.readUTF(this.file))
  },
  
  encode: function(playlist, options){
    options = options || {}
    var m3u = "#EXTM3U\n";
    
    playlist.songs.each(function(song){
      m3u += "#EXTINF:"
      
      if (song.metadata){
        m3u += parseInt(song.metadata.length || 0) + "," + song.displayName;
      }
      
      var path = song.path;
      
      if (options.relative)
        path = this.file.parent.getRelativePath(new air.File(file.path), true);
      
      m3u += "\n" + path + "\n"
    }.bind(this))
    
    return m3u;
  },
  
  decode: function(data){
    var listData = [];
    
    var lines = data.split("\n");
    
    var index = 0;
    var songData = null, displayName = null;
    for (var length = lines.length;index < length;index++) {
      var line = lines[index].strip();
      if (line.length > 0){
        if (line == "#EXTM3U") continue;
        else if (line.startsWith("#EXTINF:")) {
          var extinf = line.gsub(/^#EXTINF\:/,'');
          var parts = extinf.split(",");
          var songLength = parseInt(parts[0]);
          if (songLength)
            songData = {length: songLength}

          var parsedDisplayName = parts.splice(1,parts.length - 1).join(",").strip();
          if (parsedDisplayName.length > 0)
            displayName = parsedDisplayName;
        }
        else if (!line.startsWith("#")){
          var path = this.file.parent.resolvePath(line).nativePath;
          
          listData.push({metadata: songData, path: path, displayName: displayName})
          
          songData = null;
          displayName = null;
        }
      }
    }
    
    return Twump.Model.Playlist.deserialize(listData);
  }
});

Twump.Repository.Playlists.M3u.extensions = ["m3u", "m3u8"];