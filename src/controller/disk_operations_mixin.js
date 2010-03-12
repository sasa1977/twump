Twump.Controller.DiskOperationsMixin = {
  savePlayerData: function(){
    Twump.Storage.writeObject(Twump.Storage.appStorageFile('app_data.dat'), {
      volume: this.volume,
      _lastFolders: this._lastFolders,
      lastPlayedIndex: this.playlist.currentIndex()
    })
  },
  
  loadPlayerData: function(){
    var data = Twump.Storage.readObject(Twump.Storage.appStorageFile('app_data.dat'));
    if (!data) return;
    
    this.setVolume(data.volume);
    this._lastFolders = data._lastFolders;
    this.lastPlayedIndex = data.lastPlayedIndex || 0;
  },

  saveCurrentList: function(){
    this.saveList(Twump.Storage.appStorageFile('last_played.m3u'))
  },
  
  loadLastList: function(){
    ['m3u', 'twumpl'].each(function(ext){
      var file = Twump.Storage.appStorageFile('last_played.' + ext);
      if (file.exists) {
        this.loadList(file);
        this.setCurrentIndex(this.lastPlayedIndex);
        
        throw $break;
      }
    }.bind(this))
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
    this.playlist.insertPathsAt(this.playlist.currentIndex() + 1, newFiles);
    this.refreshCurrentPage();
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
        
        this.saveList(file, {relative: confirm('Use relative path?')});
      }.bind(this)
    })
  },
  
  onLoadListClick: function(){
    Twump.Api.browseForOpen({
      startIn: this.getLastFolder("playlist"), 
      onSelect: function(file){
        this.setLastFolder({playlist: file.nativePath});
        this.savePlayerData();

        this.loadList(file);
        this.setCurrentIndex(0);
      }.bind(this)
    })
  },
  
  loadList: function(file){
    if (!file.exists) return;
    
    this.setPlaylist(Twump.Repository.playlistEncoder(file).load());
  },
  
  saveList: function(file, options){
    Twump.Repository.playlistEncoder(file).save(this.playlist, options)
  }
}
