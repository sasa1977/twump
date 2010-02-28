Twump.Controller.DiskOperationsMixin = {
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
  
  onSaveListClick: function(){
    Twump.Api.browseForSave({onSelect: function(file){
      this.storage.writeData(file, this.serializePlaylist())
    }.bind(this)})
  },
  
  onLoadListClick: function(){
    Twump.Api.browseForOpen({onSelect: function(file){
      this.loadList(this.storage.readData(file));
    }.bind(this)})
  }
}
