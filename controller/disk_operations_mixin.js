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
        this.storage.writeData(file, this.serializePlaylist())
      }.bind(this)
    })
  },
  
  onLoadListClick: function(){
    Twump.Api.browseForOpen({
      startIn: this.getLastFolder("playlist"), 
      onSelect: function(file){
        this.setLastFolder({playlist: file.nativePath});
        this.savePlayerData();
        this.loadList(this.storage.readData(file));
      }.bind(this)
    })
  }
}
