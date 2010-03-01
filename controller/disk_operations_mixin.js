Twump.Controller.DiskOperationsMixin = {
  savePlayerData: function(){
    this.storage.writeAppData('app_data.dat', {
      volume: this.volume,
      _lastFolders: this._lastFolders
    })
  },
  
  loadPlayerData: function(){
    var data = this.storage.readAppData('app_data.dat');
    if (!data) return;
    this.setVolume(data.volume);
    this._lastFolders = data._lastFolders;
  },

  saveCurrentList: function(){
    this.storage.writeAppData('last_played.twumpl', this.serializePlaylist());
  },
  
  loadLastList: function(){
    this.loadList(this.storage.readAppData('last_played.twumpl'))
  },
  
  loadList: function(data){
    if (!data) return;
    this.stop();
        
    var data = this.deserializePlaylist(data);
    this.setPlaylist(data.playlist, data.currentIndex);
    this.playCurrent();
  },

  onOpenFolderClick: function(){
    this.openFolder();
  },
  
  onAddFolderClick: function(){
   (this.playlist.empty()) ? this.openFolder() : this.addFolder();
  },

  openFolder: function(){
    Twump.Api.openFolder({onSelect: this.openFolderSelected.bind(this)})
  },
  
  openFolderSelected: function(paths){
    this.stop();
    this.setPlaylist(new Twump.Model.Playlist(paths));
    this.playCurrent();
  },
  
  addFolder: function(){
    Twump.Api.openFolder({onSelect: this.addFolderSelected.bind(this)})
  },
  
  addFolderSelected: function(newFiles){
    this.playlist.insertPathsAt(this.currentIndex() + 1, newFiles);
    this.redrawPlayList();
  },
  
  onFilesDropped: function(files){
    this.addFolderSelected(files);
  },
  
  setLastFolder: function(data){
    this._lastFolders = this._lastFolders || {};
    Object.extend(this._lastFolders, data);
  },
  
  getLastFolder: function(key){
    lf = this._lastFolders
    return (this._lastFolders || {})[key];
  },
  
  onSaveListClick: function(){
    Twump.Api.browseForSave({
      startIn: this.getLastFolder("playlist"),
      onSelect: function(file){
        this.setLastFolder({playlist: file.nativePath});
        this.savePlayerData();
        
        (new Twump.Storage.Text()).writeData(file, this.toM3u());
      }.bind(this)
    })
  },
  
  toM3u: function(){
    var m3u = "#EXTM3U\n";
    
    this.playlist.files.each(function(file){
      m3u += "#EXTINF:"
      
      if (file.metadata){
        m3u += parseInt(file.metadata.length || 0) + "," + 
          [file.metadata.performer, file.metadata.name].compact().join("-");
      }
      m3u += "\n" + file.path + "\n"
    }.bind(this))
    
    return m3u;
  },
  
  fromM3u: function(data){
    var result = {current: 0, listData: [], version: 1}
    
    var lines = data.split("\n");
    
    var index = 0;
    var fileData = null, displayName = null;
    for (var length = lines.length;index < length;index++) {
      var line = lines[index].strip();
      if (line.length > 0){
        if (line == "#EXTM3U") continue;
        else if (line.startsWith("#EXTINF:")) {
          var extinf = line.gsub(/^#EXTINF\:/,'');
          var parts = extinf.split(",");
          var songLength = parseInt(parts[0]);
          if (songLength)
            fileData = {length: songLength}

          var parsedDisplayName = parts.splice(1,parts.length - 1).join(",").strip();
          if (parsedDisplayName.length > 0)
            displayName = parsedDisplayName;
        }
        else if (!line.startsWith("#")){
          result.listData.push({metadata: fileData, path: line, displayName: displayName})
          fileData = null;
          displayName = null;
        }
      }
    }
    
    return result;
  },
  
  onLoadListClick: function(){
    Twump.Api.browseForOpen({
      startIn: this.getLastFolder("playlist"), 
      onSelect: function(file){
        this.setLastFolder({playlist: file.nativePath});
        this.savePlayerData();
        this.loadList(this.fromM3u((new Twump.Storage.Text()).readData(file)));
      }.bind(this)
    })
  }
}
